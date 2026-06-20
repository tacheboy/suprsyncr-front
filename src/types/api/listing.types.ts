// src/types/api/listing.types.ts
// Listing types

import { PlatformType } from './seller.types';

export type ListingStatus = 'PENDING' | 'ACTIVE' | 'FAILED' | 'DELISTED';

export interface Listing {
  id: number;
  productId: number;
  productName: string;
  platformId: number;
  platformType: PlatformType;
  externalId: string;
  status: ListingStatus;
  errorMessage?: string;
  createdAt: string;
  syncedAt: string;
}
