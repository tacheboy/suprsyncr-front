// src/components/layout/Providers.tsx
'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import { Toaster } from '@/components/ui/toaster';
import { AuthInit } from './AuthInit';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInit />
      {children}
      <Toaster />
    </Provider>
  );
}
