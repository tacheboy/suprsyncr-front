// src/store/services/analyticsApi.ts
// RTK Query slice for Suprsyncr Analytics Module
// Phases 0-4: dummy store data + analytics computation endpoints

import { baseApi } from './baseApi';

// ─── Response shape types ─────────────────────────────────────

export interface DummyStore {
  storeId: string;
  storeName: string;
  category: string;
  monthlyTraffic: number;
  avgOrderValue: number;
  primaryTrafficSource: string;
}

export interface StoreSummary {
  storeId: string;
  storeName: string;
  category: string;
  dataSource: string;
  monthlyTraffic: number;
  avgOrderValue: number;
  primaryTrafficSource: string;
  totalProducts: number;
  totalMonthlyRevenue: number;
  overallConversionRate: number;
  overallAbandonmentRate: number;
  totalMonthlyOrders: number;
}

export interface ProductLeakBreakdown {
  productId: string;
  name: string;
  leakINR: number;
  abandonmentRate: number;
  addToCartCount: number;
  purchaseCount: number;
}

export interface SourceLeakBreakdown {
  source: string;
  leakINR: number;
  abandonmentRate: number;
  sessions: number;
  purchasedSessions: number;
}

export interface RevenueLeakData {
  storeId: string;
  storeName: string;
  dataSource: string;
  totalLeakINR: number;
  cartAbandonmentLossINR: number;
  checkoutDropLossINR: number;
  overallAbandonmentRate: number;
  byProduct: ProductLeakBreakdown[];
  bySource: SourceLeakBreakdown[];
  analystNote?: string;
}

export type QuadrantType = 'WINNER' | 'LISTING_PROBLEM' | 'SEO_PROBLEM' | 'WRONG_PLATFORM';
export type CtaActionType = 'OPTIMIZE_LISTING' | 'OPTIMIZE_SEO' | 'SUGGEST_PLATFORMS';

export interface ProductQuadrant {
  productId: string;
  name: string;
  category: string;
  price: number;
  pageViews: number;
  conversionRate: number;
  abandonmentRate: number;
  trafficPercentile: number;
  conversionPercentile: number;
  quadrant: QuadrantType;
  reason: string;
  ctaLabel: string;
  ctaAction: CtaActionType;
  estimatedDailyImpactINR: number;
}

export interface ActionQueueItem {
  rank: number;
  productId: string;
  productName: string;
  action: string;
  description: string;
  estimatedDailyImpactINR: number;
  ctaLabel: string;
  ctaAction: CtaActionType;
}

export interface ProductHealthData {
  storeId: string;
  storeName: string;
  dataSource: string;
  products: ProductQuadrant[];
  actionQueue: ActionQueueItem[];
  analystNote?: string;
}

export interface KeywordOpportunity {
  productId: string;
  productName: string;
  query: string;
  currentPosition: number;
  currentCtr: number;
  impressions: number;
  currentClicks: number;
  targetCtr: number;
  targetPosition: number;
  estimatedNewClicksPerMonth: number;
  estimatedRevenuePerMonth: number;
  opportunityScore: number;
}

export interface SeoGapData {
  storeId: string;
  storeName: string;
  dataSource: string;
  totalOpportunityINR: number;
  opportunities: KeywordOpportunity[];
  analystNote?: string;
}

// ─── Envelope wrappers ────────────────────────────────────────

interface AnalyticsEnvelope<T> {
  success: boolean;
  storeId: string;
  dataSource: string;
  data: T;
}

interface DummyStoresResponse {
  success: boolean;
  dataSource: string;
  count: number;
  stores: DummyStore[];
}

interface DummySummaryResponse {
  success: boolean;
  dataSource: string;
  summary: StoreSummary;
}

// ─── API slice ────────────────────────────────────────────────

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // Phase 0 — Dummy data endpoints
    getDummyStores: builder.query<DummyStoresResponse, void>({
      query: () => '/api/dummy/stores',
      providesTags: ['Analytics'],
    }),

    getStoreSummary: builder.query<DummySummaryResponse, string>({
      query: (storeId) => `/api/dummy/store/${storeId}/summary`,
      providesTags: (_, __, storeId) => [{ type: 'Analytics', id: storeId }],
    }),

    // Phase 1 — Revenue Leak
    getRevenueLeak: builder.query<AnalyticsEnvelope<RevenueLeakData>, { storeId: string; refresh?: boolean }>({
      query: ({ storeId, refresh = false }) =>
        `/api/analytics/${storeId}/revenue-leak${refresh ? '?refresh=true' : ''}`,
      providesTags: (_, __, { storeId }) => [{ type: 'Analytics', id: `${storeId}-revenue` }],
      keepUnusedDataFor: 300, // 5 min — snapshot data is stable until daily cron
    }),

    // Phase 2 — Product Health Matrix
    getProductHealth: builder.query<AnalyticsEnvelope<ProductHealthData>, { storeId: string; refresh?: boolean }>({
      query: ({ storeId, refresh = false }) =>
        `/api/analytics/${storeId}/product-health${refresh ? '?refresh=true' : ''}`,
      providesTags: (_, __, { storeId }) => [{ type: 'Analytics', id: `${storeId}-health` }],
      keepUnusedDataFor: 300,
    }),

    // Phase 3 — SEO Gap Analyzer
    getSeoGaps: builder.query<AnalyticsEnvelope<SeoGapData>, { storeId: string; refresh?: boolean }>({
      query: ({ storeId, refresh = false }) =>
        `/api/analytics/${storeId}/seo-gaps${refresh ? '?refresh=true' : ''}`,
      providesTags: (_, __, { storeId }) => [{ type: 'Analytics', id: `${storeId}-seo` }],
      keepUnusedDataFor: 300,
    }),

    // Phase 4 — Force refresh all (triggers Gemini)
    refreshAllAnalytics: builder.mutation<{ success: boolean; storeId: string; message: string }, string>({
      query: (storeId) => ({
        url: `/api/analytics/${storeId}/refresh`,
        method: 'POST',
      }),
      invalidatesTags: (_, __, storeId) => [
        { type: 'Analytics', id: `${storeId}-revenue` },
        { type: 'Analytics', id: `${storeId}-health` },
        { type: 'Analytics', id: `${storeId}-seo` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDummyStoresQuery,
  useGetStoreSummaryQuery,
  useGetRevenueLeakQuery,
  useGetProductHealthQuery,
  useGetSeoGapsQuery,
  useRefreshAllAnalyticsMutation,
} = analyticsApi;
