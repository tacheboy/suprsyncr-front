import { baseApi } from './baseApi';

export interface StudioCopyColumn {
  title: string;
  bullets: string[];
  description: string;
}

export interface StudioSeoColumn {
  handle: string;
  tags: string[];
  search_terms: string[];
  meta_title: string;
  meta_description: string;
}

export interface StudioMetadataColumn {
  product_type: string;
  vendor: string;
  attributes: Record<string, unknown>;
  condition: string;
}

export interface StudioServices {
  /** Product optimisation → listing copy (title, bullets, description). */
  product: boolean;
  /** SEO optimisation → handle, tags, search terms, meta. */
  seo: boolean;
  /** Platform metadata → product type, vendor, attributes. */
  platform: boolean;
}

export interface CreateDraftRequest {
  storeId: string;
  /** http(s) URL or a base64 data: URL — engine passes it to the vision model. */
  imageUrl: string;
  claimedTitle: string;
  posture?: 'balanced' | 'aggressive' | 'conservative';
  services?: StudioServices;
}

export interface StudioDraft {
  draftId: string;
  storeId: string;
  status: 'PENDING_AI' | 'AI_COMPLETE' | 'PUBLISHED' | 'FAILED';
  imageUrl: string;
  claimedTitle: string;
  copyColumn: StudioCopyColumn | null;
  seoColumn: StudioSeoColumn | null;
  metadataColumn: StudioMetadataColumn | null;
  identifiedProduct: {
    title: string;
    brand: string;
    model: string;
    attributes: Record<string, unknown>;
    confidence: number;
  } | null;
  mismatchWarning: {
    mismatch: boolean;
    seller_claim: string;
    identified: string;
    recommendation: string;
  } | null;
  modelPath: string | null;
  costInr: number | null;
  confidence: number | null;
  planReasoning: string | null;
  publishedProductId: number | null;
  shopifyProductId: string | null;
  errorMessage: string | null;
  createdAt: string;
  aiCompletedAt: string | null;
  publishedAt: string | null;
}

export interface PublishDraftRequest {
  copyColumn?: StudioDraft['copyColumn'];
  seoColumn?: StudioDraft['seoColumn'];
  metadataColumn?: StudioDraft['metadataColumn'];
  /** Optional — omit to list at ₹0 and price later. */
  basePriceInr?: number;
  skuOverride?: string;
  acceptMismatchOverride?: boolean;
}

export const studioApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createStudioDraft: builder.mutation<StudioDraft, CreateDraftRequest>({
      query: (body) => ({
        url: '/api/v1/products/studio/draft',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'StudioDrafts', id: 'LIST' }],
    }),
    getStudioDraft: builder.query<StudioDraft, string>({
      query: (draftId) => `/api/v1/products/studio/drafts/${draftId}`,
      providesTags: (_, __, draftId) => [{ type: 'StudioDrafts', id: draftId }],
    }),
    listStudioDrafts: builder.query<StudioDraft[], string>({
      query: (storeId) => ({
        url: '/api/v1/products/studio/drafts',
        params: { storeId },
      }),
      providesTags: (result) => [
        { type: 'StudioDrafts', id: 'LIST' },
        ...(result ?? []).map((draft) => ({ type: 'StudioDrafts' as const, id: draft.draftId })),
      ],
    }),
    publishStudioDraft: builder.mutation<StudioDraft, { draftId: string; body: PublishDraftRequest }>({
      query: ({ draftId, body }) => ({
        url: `/api/v1/products/studio/drafts/${draftId}/publish`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_, __, { draftId }) => [
        { type: 'StudioDrafts', id: draftId },
        { type: 'StudioDrafts', id: 'LIST' },
        { type: 'Product', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useCreateStudioDraftMutation,
  useGetStudioDraftQuery,
  useListStudioDraftsQuery,
  usePublishStudioDraftMutation,
} = studioApi;
