// src/store/index.ts
// Redux store configuration

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from './services/baseApi';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

// Read tokens synchronously so the very first RTK Query request already has the
// Authorization header. Without this, tokens only land in Redux state after the
// first useEffect (AuthInit), causing every hook to fire with no token → 403
// → refresh cycle on each page load.
function readStoredAuth() {
  if (typeof window === 'undefined') return {};
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  if (!accessToken || !refreshToken) return {};
  return {
    auth: {
      user: null,
      seller: null,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    },
  };
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  preloadedState: readStoredAuth(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

// Enables refetchOnFocus / refetchOnReconnect globally for all RTK Query hooks
// that opt into those options (or have them set at the createApi level).
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
