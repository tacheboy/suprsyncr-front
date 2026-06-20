// src/test/typeGuards.test.ts
// Unit tests for type guard validation functions

import { describe, it, expect } from 'vitest';
import {
  isValidEnvelope,
  isValidRevenueLeakData,
  isValidProductHealthData,
  isValidSeoGapData,
  isValidProductLeakBreakdown,
  isValidSourceLeakBreakdown,
  isValidProductQuadrant,
  isValidActionQueueItem,
  isValidKeywordOpportunity,
  extractEnvelopeData,
} from '@/utils/typeGuards';

describe('isValidEnvelope', () => {
  it('accepts valid envelope', () => {
    const envelope = {
      success: true,
      storeId: 'store-123',
      dataSource: 'dummy',
      data: { some: 'data' },
    };
    expect(isValidEnvelope(envelope)).toBe(true);
  });

  it('rejects null and undefined', () => {
    expect(isValidEnvelope(null)).toBe(false);
    expect(isValidEnvelope(undefined)).toBe(false);
  });

  it('rejects missing fields', () => {
    expect(isValidEnvelope({ success: true })).toBe(false);
    expect(isValidEnvelope({ success: true, storeId: 'x' })).toBe(false);
    expect(isValidEnvelope({ success: true, storeId: 'x', dataSource: 'y' })).toBe(false);
  });

  it('rejects wrong types', () => {
    expect(isValidEnvelope({ success: 'true', storeId: 'x', dataSource: 'y', data: {} })).toBe(false);
    expect(isValidEnvelope({ success: true, storeId: 123, dataSource: 'y', data: {} })).toBe(false);
  });

  it('rejects null/undefined data', () => {
    expect(isValidEnvelope({ success: true, storeId: 'x', dataSource: 'y', data: null })).toBe(false);
    expect(isValidEnvelope({ success: true, storeId: 'x', dataSource: 'y', data: undefined })).toBe(false);
  });
});

describe('isValidRevenueLeakData', () => {
  const validData = {
    storeId: 'store-123',
    storeName: 'Test Store',
    dataSource: 'dummy',
    totalLeakINR: 84200,
    cartAbandonmentLossINR: 61000,
    checkoutDropLossINR: 23200,
    overallAbandonmentRate: 0.74,
    byProduct: [],
    bySource: [],
  };

  it('accepts valid data', () => {
    expect(isValidRevenueLeakData(validData)).toBe(true);
  });

  it('accepts valid data with optional analystNote', () => {
    expect(isValidRevenueLeakData({ ...validData, analystNote: 'Some note' })).toBe(true);
  });

  it('rejects null and undefined', () => {
    expect(isValidRevenueLeakData(null)).toBe(false);
    expect(isValidRevenueLeakData(undefined)).toBe(false);
  });

  it('rejects missing required fields', () => {
    const { totalLeakINR, ...incomplete } = validData;
    expect(isValidRevenueLeakData(incomplete)).toBe(false);
  });

  it('rejects non-finite numbers', () => {
    expect(isValidRevenueLeakData({ ...validData, totalLeakINR: NaN })).toBe(false);
    expect(isValidRevenueLeakData({ ...validData, totalLeakINR: Infinity })).toBe(false);
  });

  it('rejects non-array fields', () => {
    expect(isValidRevenueLeakData({ ...validData, byProduct: 'not-array' })).toBe(false);
    expect(isValidRevenueLeakData({ ...validData, bySource: null })).toBe(false);
  });

  it('rejects invalid analystNote type', () => {
    expect(isValidRevenueLeakData({ ...validData, analystNote: 123 })).toBe(false);
  });
});

describe('isValidProductLeakBreakdown', () => {
  const validProduct = {
    productId: 'prod-1',
    name: 'Test Product',
    leakINR: 14200,
    abandonmentRate: 0.78,
    addToCartCount: 120,
    purchaseCount: 26,
  };

  it('accepts valid product', () => {
    expect(isValidProductLeakBreakdown(validProduct)).toBe(true);
  });

  it('rejects missing fields', () => {
    const { leakINR, ...incomplete } = validProduct;
    expect(isValidProductLeakBreakdown(incomplete)).toBe(false);
  });

  it('rejects non-finite numbers', () => {
    expect(isValidProductLeakBreakdown({ ...validProduct, leakINR: NaN })).toBe(false);
  });
});

describe('isValidSourceLeakBreakdown', () => {
  const validSource = {
    source: 'instagram',
    leakINR: 42000,
    abandonmentRate: 0.81,
    sessions: 1200,
    purchasedSessions: 228,
  };

  it('accepts valid source', () => {
    expect(isValidSourceLeakBreakdown(validSource)).toBe(true);
  });

  it('rejects missing fields', () => {
    const { sessions, ...incomplete } = validSource;
    expect(isValidSourceLeakBreakdown(incomplete)).toBe(false);
  });
});

describe('isValidProductHealthData', () => {
  const validData = {
    storeId: 'store-123',
    storeName: 'Test Store',
    dataSource: 'dummy',
    products: [],
    actionQueue: [],
  };

  it('accepts valid data', () => {
    expect(isValidProductHealthData(validData)).toBe(true);
  });

  it('accepts valid data with optional analystNote', () => {
    expect(isValidProductHealthData({ ...validData, analystNote: 'Note' })).toBe(true);
  });

  it('rejects missing required fields', () => {
    const { products, ...incomplete } = validData;
    expect(isValidProductHealthData(incomplete)).toBe(false);
  });

  it('rejects non-array fields', () => {
    expect(isValidProductHealthData({ ...validData, products: 'not-array' })).toBe(false);
  });
});

describe('isValidProductQuadrant', () => {
  const validProduct = {
    productId: 'prod-1',
    name: 'Test Product',
    category: 'Fashion',
    price: 1299,
    pageViews: 450,
    conversionRate: 0.023,
    abandonmentRate: 0.78,
    trafficPercentile: 0.65,
    conversionPercentile: 0.12,
    quadrant: 'LISTING_PROBLEM' as const,
    reason: 'High traffic but low conversion',
    ctaLabel: 'Fix Listing',
    ctaAction: 'OPTIMIZE_LISTING' as const,
    estimatedDailyImpactINR: 890,
  };

  it('accepts valid product', () => {
    expect(isValidProductQuadrant(validProduct)).toBe(true);
  });

  it('accepts all valid quadrant types', () => {
    expect(isValidProductQuadrant({ ...validProduct, quadrant: 'WINNER' })).toBe(true);
    expect(isValidProductQuadrant({ ...validProduct, quadrant: 'SEO_PROBLEM' })).toBe(true);
    expect(isValidProductQuadrant({ ...validProduct, quadrant: 'WRONG_PLATFORM' })).toBe(true);
  });

  it('rejects invalid quadrant types', () => {
    expect(isValidProductQuadrant({ ...validProduct, quadrant: 'INVALID' })).toBe(false);
  });

  it('accepts all valid action types', () => {
    expect(isValidProductQuadrant({ ...validProduct, ctaAction: 'OPTIMIZE_SEO' })).toBe(true);
    expect(isValidProductQuadrant({ ...validProduct, ctaAction: 'SUGGEST_PLATFORMS' })).toBe(true);
  });

  it('rejects invalid action types', () => {
    expect(isValidProductQuadrant({ ...validProduct, ctaAction: 'INVALID' })).toBe(false);
  });
});

describe('isValidActionQueueItem', () => {
  const validItem = {
    rank: 1,
    productId: 'prod-1',
    productName: 'Test Product',
    action: 'Optimize listing',
    description: 'Fix product description',
    estimatedDailyImpactINR: 890,
    ctaLabel: 'Fix Now',
    ctaAction: 'OPTIMIZE_LISTING' as const,
  };

  it('accepts valid item', () => {
    expect(isValidActionQueueItem(validItem)).toBe(true);
  });

  it('rejects missing fields', () => {
    const { rank, ...incomplete } = validItem;
    expect(isValidActionQueueItem(incomplete)).toBe(false);
  });
});

describe('isValidSeoGapData', () => {
  const validData = {
    storeId: 'store-123',
    storeName: 'Test Store',
    dataSource: 'dummy',
    totalOpportunityINR: 125000,
    opportunities: [],
  };

  it('accepts valid data', () => {
    expect(isValidSeoGapData(validData)).toBe(true);
  });

  it('accepts valid data with optional analystNote', () => {
    expect(isValidSeoGapData({ ...validData, analystNote: 'Note' })).toBe(true);
  });

  it('rejects missing required fields', () => {
    const { totalOpportunityINR, ...incomplete } = validData;
    expect(isValidSeoGapData(incomplete)).toBe(false);
  });
});

describe('isValidKeywordOpportunity', () => {
  const validKeyword = {
    productId: 'prod-1',
    productName: 'Test Product',
    query: 'test keyword',
    currentPosition: 12.3,
    currentCtr: 0.015,
    impressions: 8500,
    currentClicks: 128,
    targetCtr: 0.045,
    targetPosition: 3,
    estimatedNewClicksPerMonth: 255,
    estimatedRevenuePerMonth: 38250,
    opportunityScore: 8750,
  };

  it('accepts valid keyword', () => {
    expect(isValidKeywordOpportunity(validKeyword)).toBe(true);
  });

  it('rejects missing fields', () => {
    const { opportunityScore, ...incomplete } = validKeyword;
    expect(isValidKeywordOpportunity(incomplete)).toBe(false);
  });

  it('rejects non-finite numbers', () => {
    expect(isValidKeywordOpportunity({ ...validKeyword, opportunityScore: NaN })).toBe(false);
  });
});

describe('extractEnvelopeData', () => {
  it('extracts valid data', () => {
    const envelope = {
      success: true,
      storeId: 'store-123',
      dataSource: 'dummy',
      data: {
        storeId: 'store-123',
        storeName: 'Test Store',
        dataSource: 'dummy',
        totalOpportunityINR: 125000,
        opportunities: [],
      },
    };

    const result = extractEnvelopeData(envelope, isValidSeoGapData);
    expect(result).not.toBeNull();
    expect(result?.totalOpportunityINR).toBe(125000);
  });

  it('returns null for invalid envelope', () => {
    const result = extractEnvelopeData({ invalid: 'data' }, isValidSeoGapData);
    expect(result).toBeNull();
  });

  it('returns null for invalid data', () => {
    const envelope = {
      success: true,
      storeId: 'store-123',
      dataSource: 'dummy',
      data: { invalid: 'data' },
    };

    const result = extractEnvelopeData(envelope, isValidSeoGapData);
    expect(result).toBeNull();
  });
});
