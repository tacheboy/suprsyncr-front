// src/components/layout/AuthInit.tsx
'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { rehydrateAuth } from '@/store/slices/authSlice';
import { useGetPlatformsQuery } from '@/store/services/sellerApi';
import { clearDemoData, isDemoMode } from '@/data/demoStore';

// Runs once on mount: restores auth state from localStorage and ensures the
// browser's demo-mode flag is cleared whenever the signed-in seller actually
// has a real connected platform — otherwise stale demo data would keep
// shadowing real backend responses (Products/Orders/etc. would look fake).
export function AuthInit() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    dispatch(rehydrateAuth());
  }, [dispatch]);

  // Only ask the backend when there's a token to send.
  const { data: platforms } = useGetPlatformsQuery(undefined, { skip: !isAuthenticated });

  useEffect(() => {
    const list = platforms?.data ?? [];
    if (list.length > 0 && isDemoMode()) {
      clearDemoData();
      // Hard reload so RTK Query refetches everything without the demo
      // interceptor in front.
      if (typeof window !== 'undefined') window.location.reload();
    }
  }, [platforms]);

  return null;
}
