import { baseApi } from './baseApi';

export interface ProposedChange {
  changeId: string;
  storeId: string;
  agentType: string;
  changeType: string;
  shopifyEntityType: string;
  shopifyEntityId: string;
  currentValue: any;
  proposedValue: any;
  agentReasoning: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  status: string;
  estimatedImpact: {
    metric: string;
    changePercent: number;
    confidence: number;
  };
}

export interface AgentRunDto {
  runId: string;
  storeId: string;
  triggeredBy: string;
  triggeredAt: string;
  status: string;
  runType: string;
  selectedAgents?: string;
  proposalsGenerated?: number;
  estimatedImpactInr?: number;
  completedAt?: string;
  errorMessage?: string;
}

export interface ServicePreview {
  listing?: { problemProductCount: number; topProductName: string; available: boolean };
  seo?: { opportunityCount: number; topKeyword: string; available: boolean };
  pricing?: { winnerCount: number; available: boolean };
  cart_recovery?: { totalLeakINR: number; abandonmentRate: number; available: boolean };
  competitor_intel?: { available: boolean };
}

export const autopilotApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Approval queue — fixed path to match backend
    getQueue: builder.query<ProposedChange[], string>({
      query: (storeId) => `/api/autopilot/proposals/${storeId}`,
      providesTags: ['AutopilotQueue'],
    }),
    approveChange: builder.mutation<ProposedChange, { changeId: string; approvedBy?: string }>({
      query: ({ changeId, approvedBy }) => ({
        url: `/api/autopilot/changes/${changeId}/approve`,
        method: 'POST',
        body: { approvedBy: approvedBy || 'seller' },
      }),
      invalidatesTags: ['AutopilotQueue'],
    }),
    applyChange: builder.mutation<{ success: boolean; changeId: string }, { changeId: string }>({
      // Credentials are loaded server-side from the store's stored OAuth token.
      query: ({ changeId }) => ({
        url: `/api/autopilot/changes/${changeId}/apply`,
        method: 'POST',
      }),
      invalidatesTags: ['AutopilotQueue'],
    }),
    rejectChange: builder.mutation<ProposedChange, string>({
      query: (changeId) => ({
        url: `/api/autopilot/changes/${changeId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: ['AutopilotQueue'],
    }),
    undoChange: builder.mutation<{ success: boolean }, { changeId: string }>({
      // Credentials are loaded server-side from the store's stored OAuth token.
      query: ({ changeId }) => ({
        url: `/api/autopilot/changes/${changeId}/undo`,
        method: 'POST',
      }),
      invalidatesTags: ['AutopilotQueue'],
    }),
    // Full pipeline run
    triggerRun: builder.mutation<AgentRunDto, string>({
      query: (storeId) => ({
        url: `/api/autopilot/run/${storeId}`,
        method: 'POST',
      }),
      invalidatesTags: ['AutopilotQueue'],
    }),
    // Individual service run
    triggerServiceRun: builder.mutation<AgentRunDto, { storeId: string; agents: string[]; productIds?: string[] }>({
      query: ({ storeId, agents, productIds }) => ({
        url: `/api/autopilot/service/${storeId}`,
        method: 'POST',
        body: { agents, productIds: productIds || null },
      }),
      invalidatesTags: ['AutopilotQueue'],
    }),
    // Services preview for cards
    getServicesPreview: builder.query<ServicePreview, string>({
      query: (storeId) => `/api/autopilot/services/${storeId}/preview`,
    }),
    // Run history
    getRuns: builder.query<AgentRunDto[], string>({
      query: (storeId) => `/api/autopilot/runs/${storeId}`,
    }),
    // Impact data
    getImpact: builder.query<any[], string>({
      query: (storeId) => `/api/autopilot/impact/${storeId}`,
    }),
  }),
});

export const {
  useGetQueueQuery,
  useApproveChangeMutation,
  useApplyChangeMutation,
  useRejectChangeMutation,
  useUndoChangeMutation,
  useTriggerRunMutation,
  useTriggerServiceRunMutation,
  useGetServicesPreviewQuery,
  useGetRunsQuery,
  useGetImpactQuery,
} = autopilotApi;
