// src/store/services/inventoryApi.ts
// Inventory API endpoints

import { baseApi } from './baseApi';
import type { Inventory, UpdateInventoryRequest, ApiResponse } from '@/types';

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductInventory: builder.query<ApiResponse<Inventory[]>, number>({
      query: (productId) => `/api/v1/inventory/product/${productId}`,
      providesTags: (_, __, productId) => [{ type: 'Inventory', id: productId }],
    }),

    getWarehouseInventory: builder.query<ApiResponse<Inventory[]>, number>({
      query: (warehouseId) => `/api/v1/inventory/warehouse/${warehouseId}`,
      providesTags: ['Inventory'],
    }),

    getLowStock: builder.query<ApiResponse<Inventory[]>, void>({
      query: () => '/api/v1/inventory/low-stock',
      providesTags: ['Inventory'],
    }),

    updateInventory: builder.mutation<
      ApiResponse<Inventory>,
      UpdateInventoryRequest
    >({
      query: (body) => ({ url: '/api/v1/inventory', method: 'PUT', body }),
      invalidatesTags: ['Inventory'],
    }),

    adjustInventory: builder.mutation<
      ApiResponse<Inventory>,
      {
        productVariantId: number;
        warehouseId: number;
        quantity: number;
        notes?: string;
      }
    >({
      query: (body) => ({
        url: '/api/v1/inventory/adjust',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Inventory'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductInventoryQuery,
  useGetWarehouseInventoryQuery,
  useGetLowStockQuery,
  useUpdateInventoryMutation,
  useAdjustInventoryMutation,
} = inventoryApi;
