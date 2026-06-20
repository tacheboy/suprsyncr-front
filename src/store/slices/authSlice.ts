// src/store/slices/authSlice.ts
// Auth state management

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser, AuthResponse, Seller } from '@/types';
import { clearDemoData } from '@/data/demoStore';

interface AuthState {
  user: AuthUser | null;
  seller: Seller | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  seller: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<AuthResponse>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      
      // Persist tokens to localStorage
      if (typeof window !== 'undefined') {
        // Clear any stale demo data from a previous session so a fresh
        // account doesn't inherit another user's demo store.
        clearDemoData();

        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
        // Also set cookie for middleware
        document.cookie = `usp-access-token=${action.payload.accessToken}; path=/`;
      }
    },
    
    setSeller(state, action: PayloadAction<Seller>) {
      state.seller = action.payload;
    },
    
    updateAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', action.payload);
        document.cookie = `usp-access-token=${action.payload}; path=/`;
      }
    },
    
    logout(state) {
      state.user = null;
      state.seller = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        document.cookie = 'usp-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        // Clear demo data so next account starts fresh
        clearDemoData();
      }
    },
    
    // Rehydrate from localStorage on app init
    rehydrateAuth(state) {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        const refresh = localStorage.getItem('refreshToken');
        if (token && refresh) {
          state.accessToken = token;
          state.refreshToken = refresh;
          state.isAuthenticated = true;
        }
      }
    },
  },
});

export const {
  setCredentials,
  setSeller,
  updateAccessToken,
  logout,
  rehydrateAuth,
} = authSlice.actions;

export default authSlice.reducer;
