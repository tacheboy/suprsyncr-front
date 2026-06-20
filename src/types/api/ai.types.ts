// Content Optimization
export interface ContentOptimizeRequest {
  currentTitle: string;
  currentDescription: string;
  category: string;
}

export interface ContentOptimizeResponse {
  optimisedTitle: string;
  bulletPoints: string[];
  productDescription: string;
  searchKeywords: string[];
  improvementNotes: string;
  crossPlatformImpact: string;
  seoScoreBefore: number;
  seoScoreAfter: number;
  latencyMs: number;
}

// Product Generation
export interface ProductGenerateRequest {
  sellerIntent: string;
  preferredCategory?: string;
}

export interface ProductGenerateResponse {
  suggestedTitle: string;
  brand: string;
  category: string;
  mrpSuggestionInr: number;
  bulletPoints: string[];
  productDescription: string;
  keyFeatures: string[];
  suggestedAttributes: Record<string, string>;
  amazonKeywords: string[];
  confidenceNote: string;
  latencyMs: number;
}

// Insights
export interface InsightResponse {
  period: string;
  headline: string;
  periodStart: string;
  periodEnd: string;
  performanceSummary?: {
    revenueTrend: string;
    keyWin: string;
    keyConcern: string;
  };
  inventoryAlerts?: Array<{
    product: string;
    unitsLeft: number;
    daysUntilStockout: number;
    action: string;
  }>;
  platformInsights?: Array<{
    platform: string;
    observation: string;
    suggestedAction: string;
  }>;
  marketTrends?: Array<{
    trend: string;
    relevance: string;
    opportunity: string;
  }>;
  actionItems?: Array<{
    priority: string;
    action: string;
    expectedImpact: string;
  }>;
  nextPeriodForecast?: string;
  financialHealth?: {
    revenueVsLastMonth: string;
    profitMarginEstimate: string;
    platformFeeObservations: string;
  };
  topPerformers?: Array<{
    product: string;
    why: string;
    diagnosis: string;
    fix: string;
  }>;
  underperformers?: Array<{
    product: string;
    why: string;
    diagnosis: string;
    fix: string;
  }>;
  competitorLandscape?: string;
  strategicRecommendations?: Array<{
    recommendation: string;
    rationale: string;
    timeframe: string;
  }>;
  nextPeriodOpportunities?: Array<{
    opportunity: string;
    actionNeeded: string;
    deadline: string;
  }>;
}

// Chat
export interface ChatSessionResponse {
  sessionId: string;
  sessionName: string;
  createdAt: string;
}

export interface ChatMessageRequest {
  message: string;
}

export interface ChatMessageResponse {
  messageId: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
  latencyMs?: number;
}
