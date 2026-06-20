// src/hooks/useActiveStoreId.ts
'use client';

import { useGetPlatformsQuery } from '@/store/services/sellerApi';

/**
 * Returns the active store ID for the current user.
 * Uses the first connected platform's store ID.
 * Falls back to 'store-a' for development/demo mode.
 */
export function useActiveStoreId(): { storeId: string; isLoading: boolean } {
  const { data: platforms, isLoading } = useGetPlatformsQuery();

  const connectedPlatforms = platforms?.data ?? [];
  const storeId = connectedPlatforms.length > 0
    ? connectedPlatforms[0].id?.toString() ?? 'store-a'
    : 'store-a';

  return { storeId, isLoading };
}
