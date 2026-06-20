'use client';

import { useState } from 'react';
import { Grid3X3, ArrowRight, Sparkles, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useGetProductHealthQuery,
  type ProductQuadrant,
  type ActionQueueItem,
  type CtaActionType,
  type ProductHealthData,
} from '@/store/services/analyticsApi';
import { ErrorState } from '@/components/ErrorState';
import { CardSkeleton } from '@/components/CardSkeleton';
import { isValidEnvelope, isValidProductHealthData, extractEnvelopeData } from '@/utils/typeGuards';
import { formatCurrency } from '@/lib/analyticsUtils';

interface Props { storeId: string; }

const QUADRANT_CONFIG = {
  WINNER:          { label: 'Winner',          color: '#16A34A', bg: 'rgba(22,163,74,0.08)',   border: 'rgba(22,163,74,0.2)',   dot: '#16A34A' },
  LISTING_PROBLEM: { label: 'Listing Problem', color: '#DC2626', bg: 'rgba(220,38,38,0.08)',   border: 'rgba(220,38,38,0.2)',   dot: '#DC2626' },
  SEO_PROBLEM:     { label: 'SEO Problem',     color: '#D97706', bg: 'rgba(217,119,6,0.08)',   border: 'rgba(217,119,6,0.2)',   dot: '#D97706' },
  WRONG_PLATFORM:  { label: 'Wrong Platform',  color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)', dot: '#7C3AED' },
} as const;

const ACTION_LABELS: Record<string, string> = {
  OPTIMIZE_LISTING: 'Fix Listing',
  OPTIMIZE_SEO: 'Improve SEO',
  SUGGEST_PLATFORMS: 'Find Platform',
};

function pct(n: number) { return (n * 100).toFixed(1) + '%'; }

function getCtaRoute(ctaAction: CtaActionType, productName: string): string {
  const tool = ctaAction === 'SUGGEST_PLATFORMS' ? 'suggest' : 'optimize';
  return `/ai/product-studio?productName=${encodeURIComponent(productName)}&tool=${tool}`;
}

export function ProductHealthMatrix({ storeId }: Props) {
  const router = useRouter();
  const { data: envelope, isLoading, isError, error, refetch } = useGetProductHealthQuery({ storeId });
  const [selected, setSelected] = useState<ProductQuadrant | null>(null);

  if (isLoading) return <CardSkeleton lines={5} />;

  if (isError || !envelope) {
    return (
      <ErrorState
        error={error || { message: 'Failed to load product health data' }}
        onRetry={() => refetch()}
        context="Product Health"
      />
    );
  }

  if (!isValidEnvelope(envelope)) {
    console.error('[ProductHealthMatrix] Invalid envelope:', envelope);
    return (
      <ErrorState
        error={{ message: 'Invalid response format' }}
        onRetry={() => refetch()}
        context="Product Health"
      />
    );
  }

  const health = extractEnvelopeData<ProductHealthData>(envelope, isValidProductHealthData);
  if (!health) {
    console.error('[ProductHealthMatrix] Invalid data payload:', envelope.data);
    return (
      <ErrorState
        error={{ message: 'Invalid data format received' }}
        onRetry={() => refetch()}
        context="Product Health"
      />
    );
  }

  const products = health.products ?? [];
  const byQ = (q: string) => products.filter(p => p.quadrant === q);

  return (
    <section
      aria-label="Product Health Matrix"
      className="rounded-2xl border overflow-hidden"
      style={{ background: 'var(--bg-white)', borderColor: 'var(--border-color)' }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center gap-3"
        style={{ borderColor: 'var(--border-color)', background: 'rgba(22,163,74,0.02)' }}>
        <div className="p-2 rounded-lg" style={{ background: 'rgba(22,163,74,0.1)' }}>
          <Grid3X3 className="h-4 w-4 text-green-600" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
            Product Health Matrix
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Every product classified by traffic × conversion
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Legend */}
        <div className="flex flex-wrap gap-2" role="list" aria-label="Quadrant legend">
          {(Object.keys(QUADRANT_CONFIG) as (keyof typeof QUADRANT_CONFIG)[]).map(q => {
            const cfg = QUADRANT_CONFIG[q];
            const count = byQ(q).length;
            return (
              <div key={q} role="listitem"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium"
                style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.dot }} aria-hidden="true" />
                {cfg.label} ({count})
              </div>
            );
          })}
        </div>

        {/* 2×2 Quadrant Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3" role="grid"
          aria-label="Product quadrant matrix">
          <QuadrantCell title="SEO Problem"     subtitle="Good product · not found"
            axis="HIGH CONV · LOW TRAFFIC"  products={byQ('SEO_PROBLEM')}
            config={QUADRANT_CONFIG.SEO_PROBLEM}     onSelect={setSelected} />
          <QuadrantCell title="Winner"           subtitle="Expand to more platforms"
            axis="HIGH CONV · HIGH TRAFFIC" products={byQ('WINNER')}
            config={QUADRANT_CONFIG.WINNER}          onSelect={setSelected} highlight />
          <QuadrantCell title="Wrong Platform"   subtitle="Wrong audience for this channel"
            axis="LOW CONV · LOW TRAFFIC"   products={byQ('WRONG_PLATFORM')}
            config={QUADRANT_CONFIG.WRONG_PLATFORM}  onSelect={setSelected} />
          <QuadrantCell title="Listing Problem"  subtitle="Traffic won't convert — fix listing"
            axis="LOW CONV · HIGH TRAFFIC"  products={byQ('LISTING_PROBLEM')}
            config={QUADRANT_CONFIG.LISTING_PROBLEM} onSelect={setSelected} />
        </div>

        {/* Axis label */}
        <div className="flex justify-between text-xs px-1" style={{ color: 'var(--text-faint)' }} aria-hidden="true">
          <span>← Low Traffic</span>
          <span>High Traffic →</span>
        </div>

        {/* Monday Morning Action Queue */}
        {(health.actionQueue?.length ?? 0) > 0 && (
          <section aria-label="Monday Morning List">
            <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Monday Morning List — Top Actions by Revenue Impact
            </p>
            <ol className="space-y-2">
              {health.actionQueue.map((item: ActionQueueItem) => (
                <li key={item.productId}
                  className="flex flex-wrap sm:flex-nowrap items-center gap-3 px-4 py-3 rounded-xl border"
                  style={{ background: 'var(--bg-page)', borderColor: 'var(--border-color)' }}>
                  <span className="text-lg font-bold tabular-nums w-6 text-center shrink-0"
                    style={{ color: 'var(--text-faint)' }} aria-label={`Priority ${item.rank}`}>
                    {item.rank}
                  </span>
                  <p className="flex-1 min-w-0 text-sm font-medium" style={{ color: 'var(--text-body)' }}>
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 ml-auto sm:ml-0">
                    <span className="text-sm font-semibold tabular-nums shrink-0" style={{ color: '#16A34A' }}>
                      {formatCurrency(item.estimatedDailyImpactINR)}/day
                    </span>
                    <button
                      className="shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:opacity-80"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--text-body)', background: 'var(--bg-white)' }}
                      onClick={() => router.push(getCtaRoute(item.ctaAction, item.productName))}
                      aria-label={`${ACTION_LABELS[item.ctaAction] ?? item.ctaLabel} for ${item.productName}`}>
                      {ACTION_LABELS[item.ctaAction] ?? item.ctaLabel}
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Gemini Analyst Note */}
        {health.analystNote && (
          <div className="rounded-xl px-4 py-3 border flex gap-3"
            style={{ background: 'rgba(108,92,231,0.04)', borderColor: 'rgba(108,92,231,0.15)' }}
            role="note" aria-label="AI Analyst Note">
            <Sparkles className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'var(--brand-accent)' }} aria-hidden="true" />
            <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-body)' }}>
              <span className="font-semibold not-italic" style={{ color: 'var(--brand-accent)' }}>Analyst Note: </span>
              {health.analystNote}
            </p>
          </div>
        )}
      </div>

      {/* Product detail drawer */}
      {selected && <ProductDrawer product={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

function QuadrantCell({ title, subtitle, axis, products, config, onSelect, highlight }: {
  title: string; subtitle: string; axis: string;
  products: ProductQuadrant[];
  config: { label: string; color: string; bg: string; border: string; dot: string };
  onSelect: (p: ProductQuadrant) => void;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border p-3 sm:p-4 min-h-[130px]"
      style={{
        background: highlight ? config.bg : 'var(--bg-page)',
        borderColor: highlight ? config.border : 'var(--border-color)',
      }}
      role="gridcell"
      aria-label={`${title}: ${products.length} product${products.length !== 1 ? 's' : ''}`}>
      <p className="text-xs font-bold mb-0.5" style={{ color: config.color }}>{title}</p>
      <p className="text-xs mb-0.5 leading-tight" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
      <p className="text-[9px] sm:text-[10px] mb-2 sm:mb-3 uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>{axis}</p>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {products.map(p => (
          <button key={p.productId} onClick={() => onSelect(p)}
            className="px-2 py-1 rounded-lg border text-xs font-medium transition-all hover:scale-105 active:scale-95"
            style={{ background: 'var(--bg-white)', borderColor: config.border, color: config.color }}
            aria-label={`View details for ${p.name}`}>
            {p.name.split(' ').slice(0, 2).join(' ')}
          </button>
        ))}
        {products.length === 0 && <span className="text-xs" style={{ color: 'var(--text-faint)' }}>None</span>}
      </div>
    </div>
  );
}

function ProductDrawer({ product, onClose }: { product: ProductQuadrant; onClose: () => void }) {
  const cfg = QUADRANT_CONFIG[product.quadrant];
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}
      role="dialog" aria-modal="true" aria-label={`Product details for ${product.name}`}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} />
      <div className="relative w-full max-w-sm h-full overflow-y-auto shadow-2xl"
        style={{ background: 'var(--bg-white)' }} onClick={e => e.stopPropagation()}>
        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold px-2 py-1 rounded-full inline-block mb-2"
                style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</p>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>{product.name}</h3>
              <p className="text-sm capitalize" style={{ color: 'var(--text-muted)' }}>
                {product.category} · ₹{product.price.toLocaleString('en-IN')}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close product details">
              <X className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Monthly Views',   value: product.pageViews.toLocaleString('en-IN') },
              { label: 'Conversion Rate', value: pct(product.conversionRate) },
              { label: 'Abandonment',     value: pct(product.abandonmentRate) },
              { label: 'Daily Impact',    value: formatCurrency(product.estimatedDailyImpactINR) },
            ].map(m => (
              <div key={m.label} className="rounded-lg p-3 border"
                style={{ background: 'var(--bg-page)', borderColor: 'var(--border-color)' }}>
                <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{m.label}</p>
                <p className="text-base font-bold" style={{ color: 'var(--text-heading)' }}>{m.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-4 border" style={{ background: cfg.bg, borderColor: cfg.border }}>
            <p className="text-sm" style={{ color: cfg.color }}>{product.reason}</p>
          </div>

          <DrawerCta ctaAction={product.ctaAction} ctaLabel={product.ctaLabel} productName={product.name} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}

function DrawerCta({ ctaAction, ctaLabel, productName, onClose }: {
  ctaAction: CtaActionType; ctaLabel: string; productName: string; onClose: () => void;
}) {
  const router = useRouter();
  return (
    <button
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors hover:opacity-90 active:scale-[0.98]"
      style={{ background: 'var(--brand-accent)', color: '#fff' }}
      onClick={() => { onClose(); router.push(getCtaRoute(ctaAction, productName)); }}>
      {ctaLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
