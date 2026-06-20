'use client';

import { Search, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useGetSeoGapsQuery,
  type KeywordOpportunity,
  type SeoGapData,
} from '@/store/services/analyticsApi';
import { ErrorState } from '@/components/ErrorState';
import { CardSkeleton } from '@/components/CardSkeleton';
import { isValidEnvelope, isValidSeoGapData, extractEnvelopeData } from '@/utils/typeGuards';
import { formatCurrency, formatPosition } from '@/lib/analyticsUtils';

interface Props { storeId: string; }

export function SeoGapCard({ storeId }: Props) {
  const router = useRouter();
  const { data: envelope, isLoading, isError, error, refetch } = useGetSeoGapsQuery({ storeId });

  // ── Loading ───────────────────────────────────────────────────────
  if (isLoading) return <CardSkeleton lines={4} />;

  // ── Error ─────────────────────────────────────────────────────────
  if (isError || !envelope) {
    return (
      <ErrorState
        error={error || { message: 'Failed to load SEO gap data' }}
        onRetry={() => refetch()}
        context="SEO Gaps"
      />
    );
  }

  // ── Envelope validation ───────────────────────────────────────────
  if (!isValidEnvelope(envelope)) {
    console.error('[SeoGapCard] Invalid envelope:', envelope);
    return (
      <ErrorState
        error={{ message: 'Invalid response format' }}
        onRetry={() => refetch()}
        context="SEO Gaps"
      />
    );
  }

  // ── Data payload validation ───────────────────────────────────────
  const seo = extractEnvelopeData<SeoGapData>(envelope, isValidSeoGapData);
  if (!seo) {
    console.error('[SeoGapCard] Invalid data payload:', envelope.data);
    return (
      <ErrorState
        error={{ message: 'Invalid data format received' }}
        onRetry={() => refetch()}
        context="SEO Gaps"
      />
    );
  }

  const opps = seo.opportunities ?? [];

  return (
    <section
      aria-label="SEO Gap Analyzer"
      className="rounded-2xl border overflow-hidden"
      style={{ background: 'var(--bg-white)', borderColor: 'var(--border-color)' }}
    >
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-3"
        style={{ borderColor: 'var(--border-color)', background: 'rgba(217,119,6,0.02)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg shrink-0" style={{ background: 'rgba(217,119,6,0.1)' }}>
            <Search className="h-4 w-4 text-amber-600" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
              Keywords You're Almost Ranking For
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Positions 8–20 with real impressions — moving to pos 3 revenue estimate
            </p>
          </div>
        </div>

        {/* Total opportunity pill */}
        <div
          className="shrink-0 px-4 py-2 rounded-xl border text-right"
          style={{ background: 'rgba(22,163,74,0.06)', borderColor: 'rgba(22,163,74,0.2)' }}
          aria-label={`Total SEO opportunity: ${formatCurrency(seo.totalOpportunityINR)} per month`}
        >
          <p className="text-xs font-medium" style={{ color: '#16A34A' }}>Total Opportunity</p>
          <p className="text-lg font-bold tabular-nums" style={{ color: '#16A34A' }}>
            {formatCurrency(seo.totalOpportunityINR)}/mo
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        {/* Keywords list */}
        <div className="space-y-3" role="list" aria-label="Keyword opportunities">
          {opps.slice(0, 8).map((opp: KeywordOpportunity, idx: number) => (
            <KeywordRow
              key={`${opp.productId}-${opp.query}`}
              opp={opp}
              rank={idx + 1}
              onFix={() => router.push(`/ai/product-studio?productName=${encodeURIComponent(opp.productName)}&keyword=${encodeURIComponent(opp.query)}&tool=optimize`)}
            />
          ))}
          {opps.length === 0 && (
            <div className="py-8 text-center">
              <Search className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--text-faint)' }} aria-hidden="true" />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No keyword gaps found for this store.
              </p>
            </div>
          )}
        </div>

        {/* Gemini Analyst Note */}
        {seo.analystNote && (
          <div
            className="rounded-xl px-4 py-3 border flex gap-3"
            style={{ background: 'rgba(108,92,231,0.04)', borderColor: 'rgba(108,92,231,0.15)' }}
            role="note"
            aria-label="AI Analyst Note"
          >
            <Sparkles className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'var(--brand-accent)' }} aria-hidden="true" />
            <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-body)' }}>
              <span className="font-semibold not-italic" style={{ color: 'var(--brand-accent)' }}>Analyst Note: </span>
              {seo.analystNote}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function KeywordRow({ opp, rank, onFix }: {
  opp: KeywordOpportunity;
  rank: number;
  onFix: () => void;
}) {
  return (
    <div
      className="rounded-xl border px-3 sm:px-4 py-3 hover:border-amber-200 transition-colors"
      style={{ background: 'var(--bg-page)', borderColor: 'var(--border-color)' }}
      role="listitem"
      aria-label={`${rank}. ${opp.query} — ${formatCurrency(opp.estimatedRevenuePerMonth)} per month opportunity`}
    >
      {/* Top row: rank + keyword + fix button */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold w-5 text-center tabular-nums shrink-0"
          style={{ color: 'var(--text-faint)' }} aria-hidden="true">
          {rank}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-heading)' }}>
            "{opp.query}"
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
            {opp.productName}
          </p>
        </div>

        <button
          className="shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:scale-105 active:scale-95"
          style={{ borderColor: 'rgba(217,119,6,0.3)', color: '#D97706', background: 'rgba(217,119,6,0.06)' }}
          onClick={onFix}
          aria-label={`Fix listing for keyword: ${opp.query}`}
        >
          Fix <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </button>
      </div>

      {/* Bottom row: position move + revenue estimate */}
      <div className="flex items-center gap-2 sm:gap-3 mt-2 ml-8">
        <span className="px-2 py-0.5 rounded-md text-xs font-semibold tabular-nums"
          style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626' }}>
          {formatPosition(opp.currentPosition)}
        </span>
        <TrendingUp className="h-3.5 w-3.5 text-green-500 shrink-0" aria-hidden="true" />
        <span className="px-2 py-0.5 rounded-md text-xs font-semibold tabular-nums"
          style={{ background: 'rgba(22,163,74,0.08)', color: '#16A34A' }}>
          Pos {opp.targetPosition}
        </span>

        <span className="ml-auto text-xs font-bold tabular-nums" style={{ color: '#16A34A' }}>
          {formatCurrency(opp.estimatedRevenuePerMonth)}/mo
        </span>
        <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-muted)' }}>
          +{opp.estimatedNewClicksPerMonth} clicks
        </span>
      </div>
    </div>
  );
}
