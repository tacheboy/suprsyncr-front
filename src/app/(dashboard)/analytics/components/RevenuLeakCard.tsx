'use client';

import { TrendingDown, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetRevenueLeakQuery, type RevenueLeakData } from '@/store/services/analyticsApi';
import { ErrorState } from '@/components/ErrorState';
import { CardSkeleton } from '@/components/CardSkeleton';
import { isValidEnvelope, isValidRevenueLeakData, extractEnvelopeData } from '@/utils/typeGuards';
import { formatCurrency } from '@/lib/analyticsUtils';

function pct(n: number) {
  return (n * 100).toFixed(0) + '%';
}

interface Props { storeId: string; }

export function RevenuLeakCard({ storeId }: Props) {
  const router = useRouter();
  const { data: envelope, isLoading, isError, error, refetch } = useGetRevenueLeakQuery({ storeId });

  // Loading state
  if (isLoading) {
    return <CardSkeleton lines={4} />;
  }

  // Error state with retry functionality
  if (isError || !envelope) {
    return (
      <ErrorState
        error={error || { message: 'Failed to load revenue leak data' }}
        onRetry={() => refetch()}
        context="Revenue Leak"
      />
    );
  }

  // Type guard validation
  if (!isValidEnvelope(envelope)) {
    console.error('Invalid envelope structure for revenue leak:', envelope);
    return (
      <ErrorState
        error={{ message: 'Invalid response format' }}
        onRetry={() => refetch()}
        context="Revenue Leak"
      />
    );
  }

  // Extract and validate data payload
  const leak = extractEnvelopeData<RevenueLeakData>(envelope, isValidRevenueLeakData);
  
  if (!leak) {
    console.error('Invalid revenue leak data payload:', envelope.data);
    return (
      <ErrorState
        error={{ message: 'Invalid data format received' }}
        onRetry={() => refetch()}
        context="Revenue Leak"
      />
    );
  }

  const cartPct = leak.totalLeakINR > 0
    ? Math.round((leak.cartAbandonmentLossINR / leak.totalLeakINR) * 100)
    : 0;
  const checkoutPct = 100 - cartPct;
  const worst = leak.byProduct?.[0];
  const topSource = leak.bySource?.[0];

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: 'var(--bg-white)', borderColor: 'var(--border-color)' }}>

      {/* Header stripe */}
      <div className="px-6 py-4 border-b flex items-center gap-3"
        style={{ borderColor: 'var(--border-color)', background: 'rgba(220,38,38,0.03)' }}>
        <div className="p-2 rounded-lg" style={{ background: 'rgba(220,38,38,0.1)' }}>
          <TrendingDown className="h-4 w-4 text-red-600" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
            Revenue Lost This Month
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Cart abandonment + checkout drop — last 30 days
          </p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Big number */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider mb-1"
              style={{ color: 'var(--text-muted)' }}>Total Revenue Leak</p>
            <p 
              className="text-5xl font-bold tabular-nums leading-none" 
              style={{ color: '#DC2626' }}
              aria-label={`Total revenue lost: ${formatCurrency(leak.totalLeakINR)}`}
            >
              {formatCurrency(leak.totalLeakINR)}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {pct(leak.overallAbandonmentRate ?? 0)} overall abandonment rate
            </p>
          </div>

          {/* Breakdown bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                <span>Cart abandonment</span>
                <span className="font-semibold" style={{ color: 'var(--text-body)' }}>
                  {formatCurrency(leak.cartAbandonmentLossINR)} ({cartPct}%)
                </span>
              </div>
              <div 
                className="h-2 rounded-full" 
                style={{ background: 'var(--bg-muted)' }}
                role="progressbar"
                aria-valuenow={cartPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Cart abandonment: ${cartPct}% of total revenue leak`}
              >
                <div className="h-2 rounded-full bg-red-500 transition-all duration-700"
                  style={{ width: `${cartPct}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                <span>Checkout drop</span>
                <span className="font-semibold" style={{ color: 'var(--text-body)' }}>
                  {formatCurrency(leak.checkoutDropLossINR)} ({checkoutPct}%)
                </span>
              </div>
              <div 
                className="h-2 rounded-full" 
                style={{ background: 'var(--bg-muted)' }}
                role="progressbar"
                aria-valuenow={checkoutPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Checkout drop: ${checkoutPct}% of total revenue leak`}
              >
                <div className="h-2 rounded-full bg-orange-400 transition-all duration-700"
                  style={{ width: `${checkoutPct}%` }} />
              </div>
            </div>
          </div>

          {/* Worst product callout */}
          {worst && (
            <div className="rounded-xl p-4 border" style={{ background: 'rgba(220,38,38,0.04)', borderColor: 'rgba(220,38,38,0.15)' }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
                <span className="text-xs font-semibold text-red-600">Worst offender</span>
              </div>
              <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-heading)' }}>
                {worst.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {pct(worst.abandonmentRate)} abandonment · {formatCurrency(worst.leakINR)} lost
              </p>
              <button 
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                aria-label={`Fix listing for ${worst.name}`}
                onClick={() => router.push(`/ai/product-studio?productName=${encodeURIComponent(worst.name)}&tool=optimize`)}
              >
                Fix Listing <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {/* Right — per-product + per-source tables */}
        <div className="lg:col-span-3 space-y-5">
          {/* By product */}
          <div>
            <p className="text-xs font-semibold mb-3 uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}>By Product</p>
            <div className="space-y-2">
              {leak.byProduct?.map(p => (
                <div key={p.productId}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors hover:border-red-200"
                  style={{ background: 'var(--bg-page)', borderColor: 'var(--border-color)' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-body)' }}>
                      {p.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {pct(p.abandonmentRate)} abandon · {p.addToCartCount.toLocaleString()} added
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums shrink-0" style={{ color: '#DC2626' }}>
                    {formatCurrency(p.leakINR)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* By source */}
          <div>
            <p className="text-xs font-semibold mb-3 uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}>By Traffic Source</p>
            <div className="grid grid-cols-2 gap-2">
              {leak.bySource?.map(s => (
                <div key={s.source}
                  className="px-3 py-2.5 rounded-lg border"
                  style={{ background: 'var(--bg-page)', borderColor: 'var(--border-color)' }}>
                  <p className="text-xs font-semibold capitalize mb-0.5" style={{ color: 'var(--text-body)' }}>
                    {s.source}
                  </p>
                  <p className="text-sm font-bold tabular-nums" style={{ color: '#DC2626' }}>
                    {formatCurrency(s.leakINR)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {pct(s.abandonmentRate)} abandon
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gemini Analyst Note */}
      {leak.analystNote && (
        <div className="px-6 pb-5">
          <div className="rounded-xl px-4 py-3 border flex gap-3"
            style={{ background: 'rgba(108,92,231,0.04)', borderColor: 'rgba(108,92,231,0.15)' }}>
            <Sparkles className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'var(--brand-accent)' }} />
            <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-body)' }}>
              <span className="font-semibold not-italic" style={{ color: 'var(--brand-accent)' }}>Analyst Note: </span>
              {leak.analystNote}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
