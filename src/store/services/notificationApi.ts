import { baseApi } from './baseApi';
import type { ApiResponse } from '@/types';

export type NotificationType =
  | 'NEW_ORDER'
  | 'ORDER_UPDATED'
  | 'ORDER_CANCELLED'
  | 'PAYMENT_SUCCESSFUL'
  | 'ORDER_FULFILLED'
  | 'ATTRIBUTION_COMPLETED';

export interface StoreNotification {
  id: number;
  type: NotificationType;
  webhookTopic: string;
  externalOrderId: string | null;
  customerName: string | null;
  orderTotal: number | null;
  currency: string | null;
  paymentStatus: string | null;
  platformId: number;
  read: boolean;
  createdAt: string;
  readAt: string | null;
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<ApiResponse<StoreNotification[]>, { unreadOnly?: boolean; limit?: number } | void>({
      query: (params) => ({
        url: '/api/v1/notifications',
        params: { unreadOnly: params?.unreadOnly ?? false, limit: params?.limit ?? 50 },
      }),
      providesTags: ['Notifications'],
    }),
    getUnreadNotificationCount: builder.query<ApiResponse<{ count: number }>, void>({
      query: () => '/api/v1/notifications/unread-count',
      providesTags: ['Notifications'],
    }),
    markNotificationRead: builder.mutation<ApiResponse<StoreNotification>, number>({
      query: (notificationId) => ({
        url: `/api/v1/notifications/${notificationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
    markAllNotificationsRead: builder.mutation<ApiResponse<void>, void>({
      query: () => ({ url: '/api/v1/notifications/read-all', method: 'POST' }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;
