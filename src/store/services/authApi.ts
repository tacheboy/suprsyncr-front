// src/store/services/authApi.ts
// Authentication API endpoints

import { baseApi } from './baseApi';
import type {
  ApiResponse,
  AuthResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  RefreshRequest,
  AuthUser,
} from '@/types';
import type { Seller } from '@/types';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<AuthResponse>, RegisterRequest>({
      query: (body) => ({
        url: '/api/v1/auth/register',
        method: 'POST',
        body,
      }),
    }),

    login: builder.mutation<ApiResponse<AuthResponse>, LoginRequest>({
      query: (body) => ({
        url: '/api/v1/auth/login',
        method: 'POST',
        body,
      }),
    }),

    refreshToken: builder.mutation<ApiResponse<AuthTokens>, RefreshRequest>({
      query: (body) => ({
        url: '/api/v1/auth/refresh',
        method: 'POST',
        body,
      }),
    }),

    logout: builder.mutation<ApiResponse<void>, void>({
      query: () => ({ url: '/api/v1/auth/logout', method: 'POST' }),
      invalidatesTags: ['Seller', 'Product', 'Order', 'Inventory', 'Listing'],
    }),

    getMe: builder.query<
      ApiResponse<{ user: AuthUser; seller?: Seller }>,
      void
    >({
      query: () => '/api/v1/auth/me',
      providesTags: ['Auth'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetMeQuery,
} = authApi;
