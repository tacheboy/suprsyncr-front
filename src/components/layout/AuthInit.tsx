// src/components/layout/AuthInit.tsx
'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { rehydrateAuth } from '@/store/slices/authSlice';

// Runs once on mount: restores auth state from localStorage
export function AuthInit() {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    dispatch(rehydrateAuth());
  }, [dispatch]);
  
  return null;
}
