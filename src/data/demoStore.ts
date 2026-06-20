// src/data/demoStore.ts
// LocalStorage-backed demo data store with API endpoint mapping.
// Intercepts RTK Query requests when in demo mode to return fake data.

import {
  generateDemoData,
  filterByPlatforms,
  connectedPlatformTypes,
  computeOrderStats,
} from './demoDataGenerator';
import type { DemoData } from './demoDataGenerator';
import type { InsightResponse } from '@/types';

const DEMO_DATA_KEY = 'usp-demo-data';
const DEMO_PLATFORMS_KEY = 'usp-demo-platforms'; // string[] of connected onboarding IDs

// ─── Helpers ────────────────────────────────────────────────────────────────

function now(): string {
  return new Date().toISOString();
}

function apiOk<T>(data: T, message = 'Success') {
  return { success: true, data, message, timestamp: now() };
}

function pagedOk<T>(items: T[], page: number, size: number) {
  const start = page * size;
  const content = items.slice(start, start + size);
  return {
    success: true,
    data: {
      content,
      totalElements: items.length,
      totalPages: Math.ceil(items.length / size),
      size,
      number: page,
    },
    message: 'Success',
    timestamp: now(),
  };
}

// ─── Read / Write localStorage ──────────────────────────────────────────────

function getRawData(): DemoData | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(DEMO_DATA_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DemoData;
  } catch {
    return null;
  }
}

function getConnectedIds(): string[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(DEMO_PLATFORMS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

/** Returns true if demo data has been initialised in localStorage. */
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DEMO_DATA_KEY) !== null;
}

/** Generate the full demo catalog once and persist it. Idempotent. */
export function initDemoStore(): void {
  if (getRawData()) return; // already initialised
  const data = generateDemoData();
  localStorage.setItem(DEMO_DATA_KEY, JSON.stringify(data));
}

/** Add a product to the demo database (e.g. from real API creation wrapper) */
export function addDemoProduct(product: any): void {
  const data = getRawData();
  if (!data) return;
  // Prepend so it shows up first
  data.products = [product, ...data.products];
  localStorage.setItem(DEMO_DATA_KEY, JSON.stringify(data));
}

/** Record a newly connected platform (by onboarding ID, e.g. 'amazon'). */
export function addConnectedPlatform(platformId: string): void {
  const ids = getConnectedIds();
  if (!ids.includes(platformId)) {
    ids.push(platformId);
    localStorage.setItem(DEMO_PLATFORMS_KEY, JSON.stringify(ids));
  }
}

/** Get all connected onboarding platform IDs. */
export function getConnectedPlatformIds(): string[] {
  return getConnectedIds();
}

/** Wipe all demo data (on logout). */
export function clearDemoData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DEMO_DATA_KEY);
  localStorage.removeItem(DEMO_PLATFORMS_KEY);
}

// ─── Endpoint Matcher ───────────────────────────────────────────────────────

/**
 * Attempt to serve a demo response for the given URL + query params.
 * Returns `{ data: ... }` shaped like RTK Query expects, or null if
 * this endpoint isn't handled in demo mode.
 */
export function getDemoResponse(
  url: string,
  params?: Record<string, string>,
): { data: unknown } | null {
  const rawData = getRawData();
  if (!rawData) return null;

  const connectedIds = getConnectedIds();
  if (connectedIds.length === 0) return null;

  const ptTypes = connectedPlatformTypes(connectedIds);
  const data = filterByPlatforms(rawData, ptTypes);

  // Normalise URL — strip base URL prefix if present, keep path only
  const path = url.replace(/^https?:\/\/[^/]+/, '');

  // ── GET /api/v1/seller/platforms ─────────────────────
  if (path === '/api/v1/seller/platforms') {
    return { data: apiOk(data.platforms) };
  }

  // ── GET /api/v1/products (paged) ─────────────────────
  if (path === '/api/v1/products') {
    const page = parseInt(params?.page ?? '0', 10);
    const size = parseInt(params?.size ?? '20', 10);
    let filtered = data.products;
    if (params?.status) {
      filtered = filtered.filter((p) => p.status === params.status);
    }
    if (params?.categoryId) {
      const catId = parseInt(params.categoryId, 10);
      filtered = filtered.filter((p) => p.categoryId === catId);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q),
      );
    }
    return { data: pagedOk(filtered, page, size) };
  }

  // ── GET /api/v1/products/:id ─────────────────────────
  const productMatch = path.match(/^\/api\/v1\/products\/(\d+)$/);
  if (productMatch) {
    const id = parseInt(productMatch[1]!, 10);
    const product = data.products.find((p) => p.id === id);
    if (product) return { data: apiOk(product) };
    return { data: apiOk(null) };
  }

  // ── GET /api/v1/orders (paged) ───────────────────────
  if (path === '/api/v1/orders') {
    const page = parseInt(params?.page ?? '0', 10);
    const size = parseInt(params?.size ?? '20', 10);
    let filtered = data.orders;
    if (params?.status) {
      filtered = filtered.filter((o) => o.status === params.status);
    }
    if (params?.platformType) {
      filtered = filtered.filter((o) => o.platformType === params.platformType);
    }
    return { data: pagedOk(filtered, page, size) };
  }

  // ── GET /api/v1/orders/:id ───────────────────────────
  const orderMatch = path.match(/^\/api\/v1\/orders\/(\d+)$/);
  if (orderMatch) {
    const id = parseInt(orderMatch[1]!, 10);
    const order = data.orders.find((o) => o.id === id);
    if (order) return { data: apiOk(order) };
    return { data: apiOk(null) };
  }

  // ── GET /api/v1/orders/stats ─────────────────────────
  if (path === '/api/v1/orders/stats') {
    const stats = computeOrderStats(data.orders);
    return { data: apiOk(stats) };
  }

  // ── GET /api/v1/inventory/low-stock ──────────────────
  if (path === '/api/v1/inventory/low-stock') {
    const lowStock = data.inventory.filter((inv) => inv.availableQuantity < 15);
    return { data: apiOk(lowStock) };
  }

  // ── GET /api/v1/inventory/product/:id ────────────────
  const invProductMatch = path.match(/^\/api\/v1\/inventory\/product\/(\d+)$/);
  if (invProductMatch) {
    const productId = parseInt(invProductMatch[1]!, 10);
    const product = data.products.find((p) => p.id === productId);
    if (product) {
      const variantIds = new Set(product.variants.map((v) => v.id));
      const inv = data.inventory.filter((i) => variantIds.has(i.productVariantId));
      return { data: apiOk(inv) };
    }
    return { data: apiOk([]) };
  }

  // ── GET /api/v1/categories ───────────────────────────
  if (path === '/api/v1/categories') {
    return { data: apiOk(data.categories) };
  }

  // ── GET /api/v1/listings/product/:id ─────────────────
  const listingProductMatch = path.match(/^\/api\/v1\/listings\/product\/(\d+)$/);
  if (listingProductMatch) {
    const productId = parseInt(listingProductMatch[1]!, 10);
    const filtered = data.listings.filter((l) => l.productId === productId);
    return { data: apiOk(filtered) };
  }

  // ── GET /api/v1/ai/insights/weekly ───────────────────
  if (path === '/api/v1/ai/insights/weekly') {
    const stats = computeOrderStats(data.orders);
    const insight = generateDemoWeeklyInsight(data, stats, ptTypes);
    return { data: apiOk(insight) };
  }

  // ── GET /api/v1/ai/insights/monthly ──────────────────
  if (path === '/api/v1/ai/insights/monthly') {
    const stats = computeOrderStats(data.orders);
    const insight = generateDemoMonthlyInsight(data, stats, ptTypes);
    return { data: apiOk(insight) };
  }

  // ── GET /api/v1/seller/profile ───────────────────────
  if (path === '/api/v1/seller/profile') {
    return {
      data: apiOk({
        id: 1,
        businessName: 'My Demo Business',
        gstin: '27AAPFU0939F1ZV',
        businessAddress: '42, MG Road, Mumbai, Maharashtra 400001',
        phoneNumber: '+91 9876543210',
        userId: 1,
      }),
    };
  }

  // ── GET /api/v1/seller/warehouses ────────────────────
  if (path === '/api/v1/seller/warehouses') {
    return {
      data: apiOk([
        {
          id: 1,
          name: 'Primary Warehouse - Mumbai',
          address: 'Plot 12, MIDC Industrial Area',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400093',
          isDefault: true,
        },
      ]),
    };
  }

  return null; // not handled — fall through to real API
}

// ─── Demo Mutation Interceptor ───────────────────────────────────────────────

/**
 * Intercept write mutations in demo mode that would fail on the real backend.
 * Returns `{ data: ... }` shaped like RTK Query expects, or null to fall through.
 */
export function getDemoMutationResponse(
  url: string,
  method: string,
  body?: Record<string, unknown>,
): { data: unknown } | null {
  if (!isDemoMode()) return null;

  const path = url.replace(/^https?:\/\/[^/]+/, '');
  const m = method.toUpperCase();

  // ── POST /api/v1/seller/platforms — connect a platform ───────────────────
  if (m === 'POST' && path === '/api/v1/seller/platforms') {
    const platformType = (body?.platformType as string | undefined) ?? '';
    const storeName = (body?.storeName as string | undefined) ?? `My ${platformType} Store`;

    // Derive a stable demo platform ID from the demoDataGenerator's platform list
    const rawData = getRawData();
    const allPlatforms = rawData?.platforms ?? generateDemoData().platforms;
    const existing = allPlatforms.find(
      (p) => p.platformType === platformType.toUpperCase(),
    );

    const newPlatform = {
      id: existing?.id ?? (9000 + Math.floor(Math.random() * 999)),
      platformType: platformType.toUpperCase(),
      storeName,
      isActive: true,
      connectedAt: now(),
    };

    // Register in the localStorage demo-platforms list so filterByPlatforms picks it up
    addConnectedPlatform(platformType.toLowerCase());

    return {
      data: apiOk(newPlatform, 'Platform connected successfully'),
    };
  }

  return null; // not handled — fall through to real API
}

// ─── Demo Insights ──────────────────────────────────────────────────────────

function generateDemoWeeklyInsight(
  data: ReturnType<typeof filterByPlatforms>,
  stats: ReturnType<typeof computeOrderStats>,
  platformTypes: string[],
): InsightResponse {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const lowStockItems = data.inventory
    .filter((i) => i.availableQuantity < 15)
    .slice(0, 4);

  return {
    period: 'weekly',
    headline: `Strong week — ₹${(stats.totalRevenue / 1000).toFixed(1)}K revenue across ${stats.totalOrders} orders`,
    periodStart: weekAgo.toISOString().split('T')[0]!,
    periodEnd: today.toISOString().split('T')[0]!,
    performanceSummary: {
      revenueTrend: `Revenue up 18% compared to previous week. ${stats.deliveredOrders} orders delivered successfully.`,
      keyWin: `${platformTypes[0] ?? 'Shopify'} contributed highest order volume with consistent 4.7★ ratings.`,
      keyConcern: `${stats.pendingOrders} orders still pending — consider processing within 24 hours.`,
    },
    inventoryAlerts: lowStockItems.map((inv) => ({
      product: inv.variantName,
      unitsLeft: inv.availableQuantity,
      daysUntilStockout: Math.max(1, Math.floor(inv.availableQuantity / 3)),
      action: inv.availableQuantity < 5 ? 'Reorder urgently' : 'Plan restock this week',
    })),
    platformInsights: platformTypes.slice(0, 3).map((pt) => {
      const ptOrders = data.orders.filter((o) => o.platformType === pt);
      return {
        platform: pt,
        observation: `${ptOrders.length} orders this week, ₹${ptOrders.reduce((s, o) => s + o.totalAmount, 0).toLocaleString('en-IN')} revenue`,
        suggestedAction: ptOrders.length > 20 ? 'Maintain current strategy' : 'Consider running a platform-specific promotion',
      };
    }),
    marketTrends: [
      { trend: 'Q-commerce growing 40% YoY', relevance: 'Your Blinkit presence captures quick-delivery demand', opportunity: 'List more impulse-buy products under ₹500' },
      { trend: 'Festive season prep begins', relevance: 'Early inventory planning reduces stockout risk', opportunity: 'Increase stock by 30% for top 10 SKUs' },
    ],
    actionItems: [
      { priority: 'High', action: `Process ${stats.pendingOrders} pending orders`, expectedImpact: 'Improve delivery SLA and seller rating' },
      { priority: 'Medium', action: `Restock ${lowStockItems.length} low-stock items`, expectedImpact: 'Prevent lost sales worth ~₹15K' },
      { priority: 'Low', action: 'Optimize product images for mobile', expectedImpact: '10-15% improvement in conversion rate' },
    ],
    nextPeriodForecast: `Expect ₹${((stats.totalRevenue * 1.12) / 1000).toFixed(0)}K revenue next week based on current trajectory.`,
    financialHealth: {
      revenueVsLastMonth: '+22% growth',
      profitMarginEstimate: '~28% after platform fees',
      platformFeeObservations: 'Meesho has lowest commission at 2.5%, Flipkart at 12%',
    },
    topPerformers: data.products.slice(0, 3).map((p) => {
      const units = 15 + Math.floor(Math.random() * 26);
      return {
        product: p.name,
        why: `${units} units sold, ₹${(p.basePrice * units).toLocaleString('en-IN')} revenue`,
        diagnosis: 'High search visibility and competitive pricing',
        fix: 'Maintain stock levels and consider bundling',
      };
    }),
  };
}

function generateDemoMonthlyInsight(
  data: ReturnType<typeof filterByPlatforms>,
  stats: ReturnType<typeof computeOrderStats>,
  platformTypes: string[],
): InsightResponse {
  const today = new Date();
  const monthAgo = new Date(today);
  monthAgo.setMonth(today.getMonth() - 1);

  return {
    period: 'monthly',
    headline: `Monthly summary — ₹${(stats.totalRevenue / 1000).toFixed(1)}K total revenue, ${stats.totalOrders} orders processed`,
    periodStart: monthAgo.toISOString().split('T')[0]!,
    periodEnd: today.toISOString().split('T')[0]!,
    performanceSummary: {
      revenueTrend: `Total revenue of ₹${stats.totalRevenue.toLocaleString('en-IN')} with ${stats.deliveredOrders} deliveries completed.`,
      keyWin: `Cancellation rate at just ${((stats.cancelledOrders / Math.max(1, stats.totalOrders)) * 100).toFixed(1)}% — excellent customer satisfaction.`,
      keyConcern: `Average order value of ₹${(stats.totalRevenue / Math.max(1, stats.totalOrders)).toFixed(0)} could be improved with bundling.`,
    },
    actionItems: [
      { priority: 'High', action: 'Launch a bundle deal on top 5 products', expectedImpact: 'Increase AOV by 15-20%' },
      { priority: 'Medium', action: 'Expand to another marketplace', expectedImpact: '25% more reach' },
      { priority: 'Low', action: 'Update product descriptions with AI optimiser', expectedImpact: 'Better SEO and discoverability' },
    ],
    nextPeriodForecast: `Projecting ₹${((stats.totalRevenue * 1.18) / 1000).toFixed(0)}K for next month with current growth rate.`,
  };
}
