// src/app/(dashboard)/orders/page.tsx
'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useGetOrdersQuery } from '@/store/services/orderApi';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PlatformBadge } from '@/components/shared/PlatformBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { OrderStatus } from '@/types';

/* ─────────────────────────────────────
   CONFIG
   ───────────────────────────────────── */
const ORDER_STATUSES: { value: OrderStatus; label: string; color: string; bg: string; dot: string }[] = [
  { value: 'PENDING',    label: 'Pending',    color: '#B45309', bg: '#FEF3C7', dot: '#F59E0B' },
  { value: 'ACCEPTED',   label: 'Accepted',   color: '#1D4ED8', bg: '#DBEAFE', dot: '#3B82F6' },
  { value: 'PROCESSING', label: 'Processing', color: '#6D28D9', bg: '#EDE9FE', dot: '#7C3AED' },
  { value: 'SHIPPED',    label: 'Shipped',    color: '#0E7490', bg: '#CFFAFE', dot: '#06B6D4' },
  { value: 'DELIVERED',  label: 'Delivered',  color: '#15803D', bg: '#DCFCE7', dot: '#22C55E' },
  { value: 'CANCELLED',  label: 'Cancelled',  color: '#B91C1C', bg: '#FEE2E2', dot: '#EF4444' },
];

const PLATFORMS = [
  { value: 'AMAZON',      label: 'Amazon' },
  { value: 'FLIPKART',    label: 'Flipkart' },
  { value: 'MEESHO',      label: 'Meesho' },
  { value: 'SHOPIFY',     label: 'Shopify' },
  { value: 'BLINKIT',     label: 'Blinkit' },
  { value: 'WOOCOMMERCE', label: 'WooCommerce' },
];

/* ─────────────────────────────────────
   FILTER BAR
   ───────────────────────────────────── */
function FilterBar({
  activeStatus,
  activePlatform,
  onStatusChange,
  onPlatformChange,
  onClear,
}: {
  activeStatus: string;
  activePlatform: string;
  onStatusChange: (s: string) => void;
  onPlatformChange: (p: string) => void;
  onClear: () => void;
}) {
  const [showPlatform, setShowPlatform] = useState(false);
  const hasFilters = !!activeStatus || !!activePlatform;

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E2E8F0',
        borderRadius: 14,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      {/* Filter icon label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
        <Filter size={15} />
        Filter by
      </div>

      <div style={{ width: 1, height: 22, background: '#E2E8F0', flexShrink: 0 }} />

      {/* Status pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {/* "All" pill */}
        <button
          onClick={() => onStatusChange('')}
          style={{
            padding: '5px 14px',
            borderRadius: 999,
            border: `1.5px solid ${!activeStatus ? '#6366F1' : '#E2E8F0'}`,
            background: !activeStatus ? '#EEF2FF' : '#fff',
            color: !activeStatus ? '#4F46E5' : '#64748B',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          All
        </button>

        {ORDER_STATUSES.map((s) => {
          const isActive = activeStatus === s.value;
          return (
            <button
              key={s.value}
              onClick={() => onStatusChange(isActive ? '' : s.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 999,
                border: `1.5px solid ${isActive ? s.dot : '#E2E8F0'}`,
                background: isActive ? s.bg : '#fff',
                color: isActive ? s.color : '#64748B',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: isActive ? s.dot : '#CBD5E1', flexShrink: 0 }} />
              {s.label}
            </button>
          );
        })}
      </div>

      <div style={{ width: 1, height: 22, background: '#E2E8F0', flexShrink: 0 }} />

      {/* Platform dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowPlatform((v) => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 999,
            border: `1.5px solid ${activePlatform ? '#6366F1' : '#E2E8F0'}`,
            background: activePlatform ? '#EEF2FF' : '#fff',
            color: activePlatform ? '#4F46E5' : '#64748B',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {activePlatform || 'Platform'}
          <span style={{ fontSize: 10, marginLeft: 2 }}>▼</span>
        </button>

        {showPlatform && (
          <div
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 50,
              background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)', minWidth: 160, padding: '6px',
            }}
          >
            <button
              onClick={() => { onPlatformChange(''); setShowPlatform(false); }}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: 'none', background: !activePlatform ? '#EEF2FF' : 'transparent', color: !activePlatform ? '#4F46E5' : '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >All Platforms</button>
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                onClick={() => { onPlatformChange(p.value); setShowPlatform(false); }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: 'none', background: activePlatform === p.value ? '#EEF2FF' : 'transparent', color: activePlatform === p.value ? '#4F46E5' : '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
              >{p.label}</button>
            ))}
          </div>
        )}
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <>
          <div style={{ flex: 1 }} />
          <button
            onClick={onClear}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 999,
              border: '1.5px solid #FECACA', background: '#FFF5F5',
              color: '#DC2626', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <X size={12} /> Clear filters
          </button>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────
   ACTIVE FILTER SUMMARY pill
   ───────────────────────────────────── */
function ActiveFilterSummary({ status, platform, count }: { status: string; platform: string; count?: number }) {
  if (!status && !platform) return null;
  const parts: string[] = [];
  if (status) parts.push(status.charAt(0) + status.slice(1).toLowerCase());
  if (platform) parts.push(platform.charAt(0) + platform.slice(1).toLowerCase());

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748B' }}>
      <span>Showing</span>
      {parts.map((p) => (
        <span key={p} style={{ padding: '2px 10px', background: '#EEF2FF', color: '#4F46E5', borderRadius: 20, fontWeight: 600, fontSize: 12 }}>{p}</span>
      ))}
      {count !== undefined && <span>— <strong style={{ color: '#1E293B' }}>{count}</strong> orders</span>}
    </div>
  );
}

/* ─────────────────────────────────────
   MAIN CONTENT
   ───────────────────────────────────── */
function OrdersPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') ?? '0');
  const status = searchParams.get('status') ?? '';
  const platform = searchParams.get('platform') ?? '';

  const filters = {
    page,
    status: status || undefined,
    platformType: platform || undefined,
    size: 20,
  };

  const { data, isLoading, error } = useGetOrdersQuery(filters, {
    pollingInterval: 30_000,
    refetchOnMountOrArgChange: true,
  });

  /* ── URL update helpers ── */
  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // reset to page 0 on filter change
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`${pathname}?${params.toString()}`);
  };

  const totalPages = data?.data.totalPages ?? 0;
  const totalElements = data?.data.totalElements ?? 0;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Orders"
        description={
          data
            ? `${totalElements} total orders`
            : 'Loading...'
        }
      />

      {/* ── Filter bar ── */}
      <FilterBar
        activeStatus={status}
        activePlatform={platform}
        onStatusChange={(s) => setParam('status', s)}
        onPlatformChange={(p) => setParam('platform', p)}
        onClear={clearFilters}
      />

      {/* ── Active filter summary ── */}
      {(status || platform) && (
        <ActiveFilterSummary
          status={status}
          platform={platform}
          count={totalElements}
        />
      )}

      {/* ── Orders table ── */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          Failed to load orders. Check your connection.
        </div>
      ) : data?.data.content.length === 0 ? (
        <div
          style={{
            background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14,
            padding: '60px 24px', textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p style={{ fontWeight: 600, color: '#1E293B', marginBottom: 6 }}>
            No {status ? status.toLowerCase() : ''} orders found
          </p>
          <p style={{ fontSize: 13, color: '#64748B' }}>
            {status || platform
              ? 'Try adjusting the filters above.'
              : 'Orders will appear here once your platforms sync.'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow style={{ background: '#F8FAFC' }}>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.content.map((order) => (
                  <TableRow
                    key={order.id}
                    style={{ transition: 'background 0.1s' }}
                    className="hover:bg-slate-50/60"
                  >
                    <TableCell className="font-mono text-sm">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        #{order.externalOrderId}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <PlatformBadge platform={order.platformType} />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-slate-500">{order.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} type="order" />
                    </TableCell>
                    <TableCell className="font-mono font-semibold">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {formatDate(order.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 4px',
              }}
            >
              <p style={{ fontSize: 13, color: '#64748B' }}>
                Page <strong style={{ color: '#1E293B' }}>{page + 1}</strong> of <strong style={{ color: '#1E293B' }}>{totalPages}</strong>
              </p>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 0}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '7px 14px', borderRadius: 8,
                    border: '1.5px solid #E2E8F0', background: '#fff',
                    color: page === 0 ? '#CBD5E1' : '#374151',
                    fontSize: 13, fontWeight: 500, cursor: page === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <ChevronLeft size={15} /> Prev
                </button>

                {/* Page number pills — show up to 5 around current */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                  const p = start + i;
                  return (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      style={{
                        width: 34, height: 34, borderRadius: 8,
                        border: `1.5px solid ${page === p ? '#6366F1' : '#E2E8F0'}`,
                        background: page === p ? '#EEF2FF' : '#fff',
                        color: page === p ? '#4F46E5' : '#374151',
                        fontSize: 13, fontWeight: page === p ? 700 : 500,
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {p + 1}
                    </button>
                  );
                })}

                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '7px 14px', borderRadius: 8,
                    border: '1.5px solid #E2E8F0', background: '#fff',
                    color: page >= totalPages - 1 ? '#CBD5E1' : '#374151',
                    fontSize: 13, fontWeight: 500,
                    cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrdersPageContent />
    </Suspense>
  );
}
