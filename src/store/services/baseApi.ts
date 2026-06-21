// src/store/services/baseApi.ts
// RTK Query base API with auth header injection and demo mode interception

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RootState } from '../index';
import { isDemoMode, getDemoResponse, getDemoMutationResponse } from '@/data/demoStore';
import { setCredentials, logout } from '../slices/authSlice';

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

/**
 * Wraps demoAwareBaseQuery with automatic access-token refresh.
 *
 * The access token is short-lived (15 min). When it expires the backend
 * returns 401/403; without this, every request would fail until the user
 * manually logs in again. On the first such failure we POST the refresh token
 * to /api/v1/auth/refresh, store the new tokens, and transparently retry the
 * original request. A module-level promise acts as a mutex so a burst of
 * concurrent 401s triggers exactly one refresh, not one per request.
 *
 * If the refresh itself fails (refresh token also expired/invalid), we log the
 * user out so the app redirects to login instead of silently looping.
 */
let refreshPromise: Promise<boolean> | null = null;

function isAuthEndpoint(args: string | FetchArgs): boolean {
  const url = typeof args === 'string' ? args : args.url;
  return url.includes('/api/v1/auth/');
}

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await demoAwareBaseQuery(args, api, extraOptions);

  const status = result.error?.status;
  const isAuthFailure = status === 401 || status === 403;

  // Don't try to refresh the refresh/login/register calls themselves.
  if (!isAuthFailure || isAuthEndpoint(args)) {
    return result;
  }

  const state = api.getState() as RootState;
  const refreshToken = state.auth.refreshToken;
  if (!refreshToken) {
    return result;
  }

  // Single-flight refresh: the first failing request kicks it off; the rest await it.
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshResult = await realBaseQuery(
        {
          url: '/api/v1/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions,
      );
      const body = refreshResult.data as
        | { success?: boolean; data?: { accessToken: string; refreshToken: string; user?: unknown } }
        | undefined;
      if (body?.success && body.data?.accessToken) {
        api.dispatch(setCredentials(body.data as never));
        return true;
      }
      api.dispatch(logout());
      return false;
    })().finally(() => {
      // Release the lock once the in-flight refresh settles.
      refreshPromise = null;
    });
  }

  const refreshed = await refreshPromise;
  if (refreshed) {
    // Retry the original request with the new token now in state.
    result = await demoAwareBaseQuery(args, api, extraOptions);
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  // Stale data is cleared 30 s after the last subscriber unmounts.
  // Combined with refetchOnMountOrArgChange: true on live queries, this
  // ensures the user never sees data that is more than ~30 s old.
  keepUnusedDataFor: 30,
  // Requires setupListeners(store.dispatch) in store/index.ts.
  refetchOnFocus: true,
  refetchOnReconnect: true,
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
    'StudioDrafts',
    'Notifications',
  ],
  endpoints: () => ({}),
});
