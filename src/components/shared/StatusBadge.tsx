// src/components/shared/StatusBadge.tsx

import { cn } from '@/lib/utils';
import type { OrderStatus, ListingStatus } from '@/types';

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  ACCEPTED: 'bg-blue-50 text-blue-700 border-blue-200',
  PROCESSING: 'bg-purple-50 text-purple-700 border-purple-200',
  SHIPPED: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};

const LISTING_STATUS_STYLES: Record<ListingStatus, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  ACTIVE: 'bg-green-50 text-green-700 border-green-200',
  FAILED: 'bg-red-50 text-red-700 border-red-200',
  DELISTED: 'bg-slate-50 text-slate-600 border-slate-200',
};

export function StatusBadge({
  status,
  type,
}: {
  status: string;
  type: 'order' | 'listing';
}) {
  const styles =
    type === 'order'
      ? ORDER_STATUS_STYLES[status as OrderStatus]
      : LISTING_STATUS_STYLES[status as ListingStatus];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        styles ?? 'bg-slate-50 text-slate-600 border-slate-200'
      )}
    >
      {status}
    </span>
  );
}
