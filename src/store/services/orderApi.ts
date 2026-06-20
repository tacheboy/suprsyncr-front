// src/store/services/orderApi.ts
// Order API endpoints

import { baseApi } from './baseApi';
import type {
  Order,
  OrderStatistics,
  ApiResponse,
  PagedResponse,
} from '@/types';

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<
      PagedResponse<Order>,
      {
        page?: number;
        size?: number;
        status?: string;
        platformType?: string;
        startDate?: string;
        endDate?: string;
      }
    >({
      query: (params) => ({
        url: '/api/v1/orders',
        params: { page: params.page ?? 0, size: params.size ?? 20, ...params },
      }),
      providesTags: (result) =>
        result?.data.content
          ? [
            ...result.data.content.map((o) => ({
              type: 'Order' as const,
              id: o.id,
            })),
            { type: 'Order', id: 'LIST' },
          ]
          : [{ type: 'Order', id: 'LIST' }],
    }),

    getOrder: builder.query<ApiResponse<Order>, number>({
      query: (id) => `/api/v1/orders/${id}`,
      providesTags: (_, __, id) => [{ type: 'Order', id }],
    }),

    getOrderStatistics: builder.query<
      ApiResponse<OrderStatistics>,
      { startDate: string; endDate: string }
    >({
      // query: (params) => ({ url: '/api/v1/orders/statistics', params }),
      query: (params) => ({ url: '/api/v1/orders/stats', params }),
      providesTags: ['Order'],
    }),

    acceptOrder: builder.mutation<
      ApiResponse<Order>,
      { orderId: number; warehouseId: number }
    >({
      query: ({ orderId, warehouseId }) => ({
        url: `/api/v1/orders/${orderId}/accept`,
        method: 'POST',
        body: { warehouseId },
      }),
      invalidatesTags: (_, __, { orderId }) => [
        { type: 'Order', id: orderId },
        { type: 'Order', id: 'LIST' },
      ],
    }),

    shipOrder: builder.mutation<
      ApiResponse<Order>,
      { orderId: number; trackingNumber: string; courierPartner: string }
    >({
      query: ({ orderId, ...body }) => ({
        url: `/api/v1/orders/${orderId}/ship`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_, __, { orderId }) => [{ type: 'Order', id: orderId }],
    }),

    deliverOrder: builder.mutation<ApiResponse<Order>, number>({
      query: (orderId) => ({
        url: `/api/v1/orders/${orderId}/deliver`,
        method: 'POST',
      }),
      invalidatesTags: (_, __, orderId) => [{ type: 'Order', id: orderId }],
    }),

    cancelOrder: builder.mutation<ApiResponse<Order>, number>({
      query: (orderId) => ({
        url: `/api/v1/orders/${orderId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: (_, __, orderId) => [
        { type: 'Order', id: orderId },
        { type: 'Order', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useGetOrderStatisticsQuery,
  useAcceptOrderMutation,
  useShipOrderMutation,
  useDeliverOrderMutation,
  useCancelOrderMutation,
} = orderApi;
