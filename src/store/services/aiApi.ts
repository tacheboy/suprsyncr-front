import { baseApi } from './baseApi';
import type {
  ContentOptimizeResponse,
  ProductGenerateResponse,
  InsightResponse,
  ChatSessionResponse,
  ChatMessageResponse,
} from '@/types';

// Assuming ApiResponse is in '@/types'. If not, we might need to adjust.
import type { ApiResponse } from '@/types';

export const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Content Optimization
    optimizeContent: builder.mutation<
      ApiResponse<ContentOptimizeResponse>,
      FormData
    >({
      query: (formData) => ({
        url: '/api/v1/ai/content/optimize',
        method: 'POST',
        body: formData,
      }),
    }),

    // Product Generation
    generateProduct: builder.mutation<
      ApiResponse<ProductGenerateResponse>,
      FormData
    >({
      query: (formData) => ({
        url: '/api/v1/ai/content/generate',
        method: 'POST',
        body: formData,
      }),
    }),

    suggestPlatforms: builder.mutation<
      ApiResponse<any>,
      FormData
    >({
      query: (formData) => ({
        url: '/api/v1/ai/platform/suggest',
        method: 'POST',
        body: formData,
      }),
    }),

    // Insights
    getWeeklyInsight: builder.query<ApiResponse<InsightResponse>, void>({
      query: () => '/api/v1/ai/insights/weekly',
      providesTags: ['Insights'],
    }),

    getMonthlyInsight: builder.query<ApiResponse<InsightResponse>, void>({
      query: () => '/api/v1/ai/insights/monthly',
      providesTags: ['Insights'],
    }),

    refreshWeeklyInsight: builder.mutation<ApiResponse<InsightResponse>, void>({
      query: () => '/api/v1/ai/insights/weekly?forceRefresh=true',
    }),

    refreshMonthlyInsight: builder.mutation<ApiResponse<InsightResponse>, void>({
      query: () => '/api/v1/ai/insights/monthly?forceRefresh=true',
    }),

    // Chat Sessions
    createChatSession: builder.mutation<
      ApiResponse<ChatSessionResponse>,
      { sessionName?: string }
    >({
      query: (body) => ({
        url: '/api/v1/ai/chat/sessions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ChatSessions'],
    }),

    getChatSessions: builder.query<
      ApiResponse<ChatSessionResponse[]>,
      void
    >({
      query: () => '/api/v1/ai/chat/sessions',
      providesTags: ['ChatSessions'],
    }),

    // Chat Messages
    sendChatMessage: builder.mutation<
      ApiResponse<ChatMessageResponse>,
      { sessionId: string; message: string }
    >({
      query: ({ sessionId, message }) => ({
        url: `/api/v1/ai/chat/sessions/${sessionId}/messages`,
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: (result, error, { sessionId }) => [
        { type: 'ChatMessages', id: sessionId },
      ],
    }),

    getChatHistory: builder.query<
      ApiResponse<ChatMessageResponse[]>,
      string
    >({
      query: (sessionId) => `/api/v1/ai/chat/sessions/${sessionId}/messages`,
      providesTags: (result, error, sessionId) => [
        { type: 'ChatMessages', id: sessionId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useOptimizeContentMutation,
  useGenerateProductMutation,
  useSuggestPlatformsMutation,
  useGetWeeklyInsightQuery,
  useGetMonthlyInsightQuery,
  useRefreshWeeklyInsightMutation,
  useRefreshMonthlyInsightMutation,
  useCreateChatSessionMutation,
  useGetChatSessionsQuery,
  useSendChatMessageMutation,
  useGetChatHistoryQuery,
} = aiApi;
