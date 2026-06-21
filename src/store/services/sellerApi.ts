// src/store/services/sellerApi.ts
// Seller, Warehouse, and Platform API endpoints

import { baseApi } from './baseApi';
import type {
  Seller,
  Warehouse,
  Platform,
  ConnectPlatformRequest,
  ApiResponse,
} from '@/types';

export const sellerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSeller: builder.mutation<
      ApiResponse<Seller>,
      {
        businessName: string;
        gstin: string;
        businessAddress: string;
        phoneNumber: string;
      }
    >({
      query: (body) => ({ url: '/api/v1/seller', method: 'POST', body }),
      invalidatesTags: ['Seller'],
    }),

    getSellerProfile: builder.query<ApiResponse<Seller>, void>({
      query: () => '/api/v1/seller/profile',
      providesTags: ['Seller'],
    }),

    updateSeller: builder.mutation<
      ApiResponse<Seller>,
      { sellerId: number; body: Partial<Seller> }
    >({
      query: ({ sellerId, body }) => ({
        url: `/api/v1/seller/${sellerId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Seller'],
    }),

    // Warehouses
    getWarehouses: builder.query<ApiResponse<Warehouse[]>, void>({
      query: () => '/api/v1/seller/warehouses',
      providesTags: ['Warehouse'],
    }),

    addWarehouse: builder.mutation<
      ApiResponse<Warehouse>,
      Omit<Warehouse, 'id'>
    >({
      query: (body) => ({
        url: '/api/v1/seller/warehouses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Warehouse'],
    }),

    updateWarehouse: builder.mutation<
      ApiResponse<Warehouse>,
      { id: number; body: Partial<Warehouse> }
    >({
      query: ({ id, body }) => ({
        url: `/api/v1/seller/warehouses/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Warehouse'],
    }),

    deleteWarehouse: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/api/v1/seller/warehouses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Warehouse'],
    }),

    // Platform connections
    getPlatforms: builder.query<ApiResponse<Platform[]>, void>({
      query: () => '/api/v1/seller/platforms',
      providesTags: ['Platform'],
    }),

    connectPlatform: builder.mutation<
      ApiResponse<Platform>,
      ConnectPlatformRequest
    >({
      query: (body) => ({
        url: '/api/v1/seller/platforms',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Platform'],
    }),

    disconnectPlatform: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/api/v1/seller/platforms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Platform'],
    }),

    testPlatformConnection: builder.mutation<
      ApiResponse<{ connected: boolean }>,
      number
    >({
      query: (id) => ({
        url: `/api/v1/seller/platforms/${id}/test`,
        method: 'POST',
      }),
    }),

    registerShopifyWebhooks: builder.mutation<
      ApiResponse<{
        registered: boolean;
        shopUrl: string;
        webhookEndpoint: string;
        topics: string[];
        hint: string;
      }>,
      void
    >({
      query: () => ({ url: '/api/v1/shopify/webhooks/register', method: 'POST' }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateSellerMutation,
  useGetSellerProfileQuery,
  useUpdateSellerMutation,
  useGetWarehousesQuery,
  useAddWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
  useGetPlatformsQuery,
  useConnectPlatformMutation,
  useDisconnectPlatformMutation,
  useTestPlatformConnectionMutation,
  useRegisterShopifyWebhooksMutation,
} = sellerApi;
