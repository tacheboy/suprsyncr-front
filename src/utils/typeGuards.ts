// src/utils/typeGuards.ts
// Type guards and validation functions for Analytics Frontend Completion
// Defensive validation for API responses and data payloads

import type {
  RevenueLeakData,
  ProductHealthData,
  SeoGapData,
  ProductLeakBreakdown,
  SourceLeakBreakdown,
  ProductQuadrant,
  ActionQueueItem,
  KeywordOpportunity,
} from '@/store/services/analyticsApi';

/**
 * Generic envelope structure validator
 * Validates that an object has the required envelope fields
 */
export interface AnalyticsEnvelope<T> {
  success: boolean;
  storeId: string;
  dataSource: string;
  data: T;
}

/**
 * Type guard for analytics envelope structure
 * @param data - Unknown data to validate
 * @returns True if data matches envelope structure
 */
export function isValidEnvelope<T>(data: unknown): data is AnalyticsEnvelope<T> {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const envelope = data as any;

  return (
    typeof envelope.success === 'boolean' &&
    typeof envelope.storeId === 'string' &&
    typeof envelope.dataSource === 'string' &&
    'data' in envelope &&
    envelope.data !== null &&
    envelope.data !== undefined
  );
}

/**
 * Type guard for RevenueLeakData
 * Validates all required fields and their types
 */
export function isValidRevenueLeakData(data: unknown): data is RevenueLeakData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const leak = data as any;

  // Check required string fields
  if (
    typeof leak.storeId !== 'string' ||
    typeof leak.storeName !== 'string' ||
    typeof leak.dataSource !== 'string'
  ) {
    return false;
  }

  // Check required numeric fields
  if (
    typeof leak.totalLeakINR !== 'number' ||
    !Number.isFinite(leak.totalLeakINR) ||
    typeof leak.cartAbandonmentLossINR !== 'number' ||
    !Number.isFinite(leak.cartAbandonmentLossINR) ||
    typeof leak.checkoutDropLossINR !== 'number' ||
    !Number.isFinite(leak.checkoutDropLossINR) ||
    typeof leak.overallAbandonmentRate !== 'number' ||
    !Number.isFinite(leak.overallAbandonmentRate)
  ) {
    return false;
  }

  // Check required array fields
  if (!Array.isArray(leak.byProduct) || !Array.isArray(leak.bySource)) {
    return false;
  }

  // Validate array items (at least check first item if exists)
  if (leak.byProduct.length > 0 && !isValidProductLeakBreakdown(leak.byProduct[0])) {
    return false;
  }

  if (leak.bySource.length > 0 && !isValidSourceLeakBreakdown(leak.bySource[0])) {
    return false;
  }

  // Optional field validation
  if (leak.analystNote !== undefined && typeof leak.analystNote !== 'string') {
    return false;
  }

  return true;
}

/**
 * Type guard for ProductLeakBreakdown
 */
export function isValidProductLeakBreakdown(data: unknown): data is ProductLeakBreakdown {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const product = data as any;

  return (
    typeof product.productId === 'string' &&
    typeof product.name === 'string' &&
    typeof product.leakINR === 'number' &&
    Number.isFinite(product.leakINR) &&
    typeof product.abandonmentRate === 'number' &&
    Number.isFinite(product.abandonmentRate) &&
    typeof product.addToCartCount === 'number' &&
    Number.isFinite(product.addToCartCount) &&
    typeof product.purchaseCount === 'number' &&
    Number.isFinite(product.purchaseCount)
  );
}

/**
 * Type guard for SourceLeakBreakdown
 */
export function isValidSourceLeakBreakdown(data: unknown): data is SourceLeakBreakdown {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const source = data as any;

  return (
    typeof source.source === 'string' &&
    typeof source.leakINR === 'number' &&
    Number.isFinite(source.leakINR) &&
    typeof source.abandonmentRate === 'number' &&
    Number.isFinite(source.abandonmentRate) &&
    typeof source.sessions === 'number' &&
    Number.isFinite(source.sessions) &&
    typeof source.purchasedSessions === 'number' &&
    Number.isFinite(source.purchasedSessions)
  );
}

/**
 * Type guard for ProductHealthData
 * Validates all required fields and their types
 */
export function isValidProductHealthData(data: unknown): data is ProductHealthData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const health = data as any;

  // Check required string fields
  if (
    typeof health.storeId !== 'string' ||
    typeof health.storeName !== 'string' ||
    typeof health.dataSource !== 'string'
  ) {
    return false;
  }

  // Check required array fields
  if (!Array.isArray(health.products) || !Array.isArray(health.actionQueue)) {
    return false;
  }

  // Validate array items (at least check first item if exists)
  if (health.products.length > 0 && !isValidProductQuadrant(health.products[0])) {
    return false;
  }

  if (health.actionQueue.length > 0 && !isValidActionQueueItem(health.actionQueue[0])) {
    return false;
  }

  // Optional field validation
  if (health.analystNote !== undefined && typeof health.analystNote !== 'string') {
    return false;
  }

  return true;
}

/**
 * Type guard for ProductQuadrant
 */
export function isValidProductQuadrant(data: unknown): data is ProductQuadrant {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const product = data as any;

  const validQuadrants = ['WINNER', 'LISTING_PROBLEM', 'SEO_PROBLEM', 'WRONG_PLATFORM'];
  const validActions = ['OPTIMIZE_LISTING', 'OPTIMIZE_SEO', 'SUGGEST_PLATFORMS'];

  return (
    typeof product.productId === 'string' &&
    typeof product.name === 'string' &&
    typeof product.category === 'string' &&
    typeof product.price === 'number' &&
    Number.isFinite(product.price) &&
    typeof product.pageViews === 'number' &&
    Number.isFinite(product.pageViews) &&
    typeof product.conversionRate === 'number' &&
    Number.isFinite(product.conversionRate) &&
    typeof product.abandonmentRate === 'number' &&
    Number.isFinite(product.abandonmentRate) &&
    typeof product.trafficPercentile === 'number' &&
    Number.isFinite(product.trafficPercentile) &&
    typeof product.conversionPercentile === 'number' &&
    Number.isFinite(product.conversionPercentile) &&
    typeof product.quadrant === 'string' &&
    validQuadrants.includes(product.quadrant) &&
    typeof product.reason === 'string' &&
    typeof product.ctaLabel === 'string' &&
    typeof product.ctaAction === 'string' &&
    validActions.includes(product.ctaAction) &&
    typeof product.estimatedDailyImpactINR === 'number' &&
    Number.isFinite(product.estimatedDailyImpactINR)
  );
}

/**
 * Type guard for ActionQueueItem
 */
export function isValidActionQueueItem(data: unknown): data is ActionQueueItem {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const item = data as any;

  const validActions = ['OPTIMIZE_LISTING', 'OPTIMIZE_SEO', 'SUGGEST_PLATFORMS'];

  return (
    typeof item.rank === 'number' &&
    Number.isFinite(item.rank) &&
    typeof item.productId === 'string' &&
    typeof item.productName === 'string' &&
    typeof item.action === 'string' &&
    typeof item.description === 'string' &&
    typeof item.estimatedDailyImpactINR === 'number' &&
    Number.isFinite(item.estimatedDailyImpactINR) &&
    typeof item.ctaLabel === 'string' &&
    typeof item.ctaAction === 'string' &&
    validActions.includes(item.ctaAction)
  );
}

/**
 * Type guard for SeoGapData
 * Validates all required fields and their types
 */
export function isValidSeoGapData(data: unknown): data is SeoGapData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const seo = data as any;

  // Check required string fields
  if (
    typeof seo.storeId !== 'string' ||
    typeof seo.storeName !== 'string' ||
    typeof seo.dataSource !== 'string'
  ) {
    return false;
  }

  // Check required numeric fields
  if (
    typeof seo.totalOpportunityINR !== 'number' ||
    !Number.isFinite(seo.totalOpportunityINR)
  ) {
    return false;
  }

  // Check required array field
  if (!Array.isArray(seo.opportunities)) {
    return false;
  }

  // Validate array items (at least check first item if exists)
  if (seo.opportunities.length > 0 && !isValidKeywordOpportunity(seo.opportunities[0])) {
    return false;
  }

  // Optional field validation
  if (seo.analystNote !== undefined && typeof seo.analystNote !== 'string') {
    return false;
  }

  return true;
}

/**
 * Type guard for KeywordOpportunity
 */
export function isValidKeywordOpportunity(data: unknown): data is KeywordOpportunity {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const keyword = data as any;

  return (
    typeof keyword.productId === 'string' &&
    typeof keyword.productName === 'string' &&
    typeof keyword.query === 'string' &&
    typeof keyword.currentPosition === 'number' &&
    Number.isFinite(keyword.currentPosition) &&
    typeof keyword.currentCtr === 'number' &&
    Number.isFinite(keyword.currentCtr) &&
    typeof keyword.impressions === 'number' &&
    Number.isFinite(keyword.impressions) &&
    typeof keyword.currentClicks === 'number' &&
    Number.isFinite(keyword.currentClicks) &&
    typeof keyword.targetCtr === 'number' &&
    Number.isFinite(keyword.targetCtr) &&
    typeof keyword.targetPosition === 'number' &&
    Number.isFinite(keyword.targetPosition) &&
    typeof keyword.estimatedNewClicksPerMonth === 'number' &&
    Number.isFinite(keyword.estimatedNewClicksPerMonth) &&
    typeof keyword.estimatedRevenuePerMonth === 'number' &&
    Number.isFinite(keyword.estimatedRevenuePerMonth) &&
    typeof keyword.opportunityScore === 'number' &&
    Number.isFinite(keyword.opportunityScore)
  );
}

/**
 * Validate and extract data from envelope
 * Returns null if validation fails
 */
export function extractEnvelopeData<T>(
  envelope: unknown,
  validator: (data: unknown) => data is T
): T | null {
  if (!isValidEnvelope(envelope)) {
    console.error('Invalid envelope structure:', envelope);
    return null;
  }

  if (!validator(envelope.data)) {
    console.error('Invalid data payload:', envelope.data);
    return null;
  }

  return envelope.data;
}
