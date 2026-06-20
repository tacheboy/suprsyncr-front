// src/store/services/listingApi.ts
// Listing API endpoints

import { baseApi } from './baseApi';
import type { Listing, ApiResponse } from '@/types';

export const listingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getListingsByProduct: builder.query<ApiResponse<Listing[]>, number>({
      query: (productId) => `/api/v1/listings/product/${productId}`,
      providesTags: ['Listing'],
    }),

    getListingsByPlatform: builder.query<ApiResponse<Listing[]>, number>({
      query: (platformId) => `/api/v1/listings/platform/${platformId}`,
      providesTags: ['Listing'],
    }),

    createListing: builder.mutation<
      ApiResponse<Listing[]>,
      { productId: number; platformIds: number[] }
    >({
      query: (body) => ({ url: '/api/v1/listings', method: 'POST', body }),
      invalidatesTags: ['Listing'],
    }),

    syncListing: builder.mutation<ApiResponse<Listing>, number>({
      query: (listingId) => ({
        url: `/api/v1/listings/${listingId}/sync`,
        method: 'POST',
      }),
      invalidatesTags: ['Listing'],
    }),

    retryListing: builder.mutation<ApiResponse<Listing>, number>({
      query: (listingId) => ({
        url: `/api/v1/listings/${listingId}/retry`,
        method: 'POST',
      }),
      invalidatesTags: ['Listing'],
    }),

    delistProduct: builder.mutation<ApiResponse<void>, number>({
      query: (listingId) => ({
        url: `/api/v1/listings/${listingId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Listing'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetListingsByProductQuery,
  useGetListingsByPlatformQuery,
  useCreateListingMutation,
  useSyncListingMutation,
  useRetryListingMutation,
  useDelistProductMutation,
} = listingApi;
