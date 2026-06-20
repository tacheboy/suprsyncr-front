// src/store/services/baseApi.ts
// RTK Query base API with auth header injection and demo mode interception

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RootState } from '../index';
import { isDemoMode, getDemoResponse, getDemoMutationResponse } from '@/data/demoStore';

const realBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Custom baseQuery that intercepts GET requests in demo mode.
 * If demo data exists in localStorage and the endpoint matches a known
 * pattern, the fake data is returned directly without hitting the network.
 * Mutations and unmatched endpoints fall through to the real API.
 */
const demoAwareBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  // Only intercept in demo mode and only GET requests
  if (isDemoMode()) {
    const isGetRequest =
      typeof args === 'string' || !args.method || args.method === 'GET';

    if (isGetRequest) {
      const url = typeof args === 'string' ? args : args.url;
      const params =
        typeof args === 'string'
          ? undefined
          : (args.params as Record<string, string> | undefined);

      const demoResult = getDemoResponse(url, params);
      if (demoResult) {
        return demoResult;
      }
    }

    // In demo mode, also intercept certain mutations that would fail on the real backend
    const method = typeof args === 'string' ? 'GET' : (args.method ?? 'GET');
    if (method.toUpperCase() !== 'GET') {
      const url = typeof args === 'string' ? args : args.url;
      const body = typeof args === 'string' ? undefined : (args.body as Record<string, unknown> | undefined);
      const demoMutation = getDemoMutationResponse(url, method, body);
      if (demoMutation) {
        return demoMutation;
      }
    }
  }

  // Fall through to real API
  const result = await realBaseQuery(args, api, extraOptions);

  if (isDemoMode() && result.data) {
    const method = typeof args === 'string' ? 'GET' : (args.method ?? 'GET');
    const url = typeof args === 'string' ? args : args.url;
    const path = url.replace(/^https?:\/\/[^/]+/, '');
    
    // If it was a POST to create a product, add it to demo storage so it appears in dashboard
    if (method.toUpperCase() === 'POST' && path === '/api/v1/products') {
      import('@/data/demoStore').then(({ addDemoProduct }) => {
        const apiRes = result.data as any;
        if (apiRes && apiRes.success && apiRes.data) {
          addDemoProduct(apiRes.data);
        }
      }).catch(console.error);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: demoAwareBaseQuery,
  tagTypes: [
    'Auth',
    'Seller',
    'Warehouse',
    'Platform',
    'Product',
    'Category',
    'Inventory',
    'Listing',
    'Order',
    'Insights',
    'ChatSessions',
    'ChatMessages',
    'Analytics',
    'AutopilotQueue',
  ],
  endpoints: () => ({}),
});
