'use client';

import { useState } from 'react';
import {
  TrendingUp, ArrowUpRight, ArrowDownRight, Shield, Clock, Undo2,
  Sparkles, Zap, BarChart3, CheckCircle2, AlertTriangle, Info,
  ArrowRight, FlaskConical, Eye, ThumbsUp, Activity,
} from 'lucide-react';
import Link from 'next/link';
import { useActiveStoreId } from '@/hooks/useActiveStoreId';
import { useGetImpactQuery, useUndoChangeMutation } from '@/store/services/autopilotApi';

/* ─── Types ─────────────────────────────────────────────────────────── */

interface ImpactRecord {
  impactId: string;
  changeId: string;
  storeId: string;
  metricType: string;
  baselinePeriodStart: string;
  baselinePeriodEnd: string;
  baselineValue: number;
  measurementPeriodStart: string;
  measurementPeriodEnd: string;
  measuredValue: number;
  deltaAbsolute: number;
  deltaPercent: number;
  attributionConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  attributionNotes: string;
  estimatedRevenueImpactInr: number;
  // Joined fields from proposals (may or may not exist)
  changeType?: string;
  agentType?: string;
  productName?: string;
}

/* ─── Demo Fallback Data ──────────────────────────────────────────── */
// Pre-built impact cards so the Impact Lab always shows data in demos.
// These mirror the shapes produced by ImpactTrackerService.

const DEMO_IMPACTS: ImpactRecord[] = [
  {
    impactId: 'demo-1',
    changeId: 'demo-change-1',
    storeId: 'store-a',
    metricType: 'CONVERSION_RATE',
    baselinePeriodStart: '2026-05-22',
    baselinePeriodEnd: '2026-05-28',
    baselineValue: 1.8,
    measurementPeriodStart: '2026-05-30',
    measurementPeriodEnd: '2026-06-05',
    measuredValue: 2.22,
    deltaAbsolute: 0.42,
    deltaPercent: 23.3,
    attributionConfidence: 'HIGH',
    attributionNotes: '7-day pre/post comparison — no concurrent changes',
    estimatedRevenueImpactInr: 12600,
    changeType: 'PRODUCT_TITLE',
    agentType: 'LISTING_DOCTOR',
    productName: 'Premium Linen Kurta Set — Men\'s Festive',
  },
  {
    impactId: 'demo-2',
    changeId: 'demo-change-2',
    storeId: 'store-a',
    metricType: 'ORGANIC_TRAFFIC',
    baselinePeriodStart: '2026-05-20',
    baselinePeriodEnd: '2026-05-26',
    baselineValue: 120,
    measurementPeriodStart: '2026-05-28',
    measurementPeriodEnd: '2026-06-03',
    measuredValue: 162,
    deltaAbsolute: 42,
    deltaPercent: 35.0,
    attributionConfidence: 'HIGH',
    attributionNotes: '7-day pre/post comparison — isolated SEO change',
    estimatedRevenueImpactInr: 8400,
    changeType: 'META_TITLE',
    agentType: 'SEO_COMMANDER',
    productName: 'Hand Block Printed Cotton Saree',
  },
  {
    impactId: 'demo-3',
    changeId: 'demo-change-3',
    storeId: 'store-a',
    metricType: 'CONVERSION_RATE',
    baselinePeriodStart: '2026-05-18',
    baselinePeriodEnd: '2026-05-24',
    baselineValue: 1.8,
    measurementPeriodStart: '2026-05-26',
    measurementPeriodEnd: '2026-06-01',
    measuredValue: 2.05,
    deltaAbsolute: 0.25,
    deltaPercent: 13.9,
    attributionConfidence: 'MEDIUM',
    attributionNotes: '7-day pre/post comparison — traffic source shift detected',
    estimatedRevenueImpactInr: 7500,
    changeType: 'PRODUCT_DESCRIPTION',
    agentType: 'LISTING_DOCTOR',
    productName: 'Organic Cold-Pressed Coconut Oil 500ml',
  },
  {
    impactId: 'demo-4',
    changeId: 'demo-change-4',
    storeId: 'store-a',
    metricType: 'ORGANIC_TRAFFIC',
    baselinePeriodStart: '2026-05-15',
    baselinePeriodEnd: '2026-05-21',
    baselineValue: 85,
    measurementPeriodStart: '2026-05-23',
    measurementPeriodEnd: '2026-05-29',
    measuredValue: 110,
    deltaAbsolute: 25,
    deltaPercent: 29.4,
    attributionConfidence: 'HIGH',
    attributionNotes: '7-day pre/post comparison — keyword injection drove ranking lift',
    estimatedRevenueImpactInr: 5250,
    changeType: 'META_DESCRIPTION',
    agentType: 'SEO_COMMANDER',
    productName: 'Bamboo Fibre Kitchen Towels (6-Pack)',
  },
];

/* ─── Helpers ───────────────────────────────────────────────────────── */

function formatCurrency(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function metricLabel(metricType: string): string {
  switch (metricType) {
    case 'CONVERSION_RATE': return 'Conversion Rate';
    case 'ORGANIC_TRAFFIC': return 'Organic Traffic';
    case 'REVENUE': return 'Revenue';
    case 'CART_ABANDONMENT': return 'Cart Abandonment';
    default: return metricType;
  }
}

function metricUnit(metricType: string): string {
  switch (metricType) {
    case 'CONVERSION_RATE': return '%';
    case 'ORGANIC_TRAFFIC': return ' clicks/wk';
    case 'REVENUE': return '';
    case 'CART_ABANDONMENT': return '%';
    default: return '';
  }
}

function metricDisplayValue(value: number, metricType: string): string {
  if (metricType === 'REVENUE') return formatCurrency(value);
  if (metricType === 'CONVERSION_RATE' || metricType === 'CART_ABANDONMENT') return `${value.toFixed(2)}%`;
  return Math.round(value).toLocaleString();
}

function changeTypeLabel(changeType: string): string {
  switch (changeType) {
    case 'PRODUCT_TITLE': return 'Title Change';
    case 'PRODUCT_DESCRIPTION': return 'Description Rewrite';
    case 'META_TITLE': return 'SEO Title';
    case 'META_DESCRIPTION': return 'SEO Description';
    case 'PRICE_CHANGE': return 'Price Adjustment';
    case 'CART_RECOVERY_COPY': return 'Cart Recovery';
    default: return changeType;
  }
}

function agentLabel(agentType: string): string {
  switch (agentType) {
    case 'LISTING_DOCTOR': return 'Listing Doctor';
    case 'SEO_COMMANDER': return 'SEO Commander';
    case 'CART_RECOVERY': return 'Cart Recovery';
    case 'PRICING_STRATEGIST': return 'Pricing Strategist';
    default: return agentType;
  }
}

const confidenceConfig = {
  HIGH: { color: '#16a34a', bg: 'rgba(22,163,74,0.08)', icon: CheckCircle2, label: 'High Confidence' },
  MEDIUM: { color: '#d97706', bg: 'rgba(217,119,6,0.08)', icon: AlertTriangle, label: 'Medium Confidence' },
  LOW: { color: '#dc2626', bg: 'rgba(220,38,38,0.08)', icon: Info, label: 'Low Confidence' },
};

/* ─── Impact Card ───────────────────────────────────────────────────── */

function ImpactCard({ impact, onUndo, isDemo }: { impact: ImpactRecord; onUndo?: () => void; isDemo: boolean }) {
  const isPositive = impact.deltaPercent > 0;
  // Cart abandonment going DOWN is good
  const isGood = impact.metricType === 'CART_ABANDONMENT' ? !isPositive : isPositive;
  const conf = confidenceConfig[impact.attributionConfidence];
  const ConfIcon = conf.icon;

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
      style={{
        background: 'var(--bg-white)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.02), 0 1px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Card header */}
      <div
        className="px-5 py-3.5 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="px-2.5 py-1 rounded-md text-xs font-bold"
            style={{
              background: 'rgba(108,92,231,0.08)',
              color: 'var(--brand-accent)',
            }}
          >
            {changeTypeLabel(impact.changeType || '')}
          </div>
          {impact.agentType && (
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              by {agentLabel(impact.agentType)}
            </span>
          )}
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: conf.bg, color: conf.color }}
        >
          <ConfIcon className="w-3 h-3" />
          {conf.label}
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 space-y-4">
        {/* Product name */}
        {impact.productName && (
          <p className="text-base font-semibold" style={{ color: 'var(--text-heading)' }}>
            {impact.productName}
          </p>
        )}

        {/* Metric comparison */}
        <div className="grid grid-cols-3 gap-4">
          {/* Baseline */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Before
            </p>
            <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--text-heading)' }}>
              {metricDisplayValue(impact.baselineValue, impact.metricType)}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {formatDate(impact.baselinePeriodStart)} – {formatDate(impact.baselinePeriodEnd)}
            </p>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: isGood ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)' }}
            >
              <ArrowRight className="w-5 h-5" style={{ color: isGood ? '#16a34a' : '#dc2626' }} />
            </div>
          </div>

          {/* Measured */}
          <div className="space-y-1 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              After
            </p>
            <p className="text-xl font-bold tabular-nums" style={{ color: isGood ? '#16a34a' : '#dc2626' }}>
              {metricDisplayValue(impact.measuredValue, impact.metricType)}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {formatDate(impact.measurementPeriodStart)} – {formatDate(impact.measurementPeriodEnd)}
            </p>
          </div>
        </div>

        {/* Delta & Revenue impact row */}
        <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3">
            {/* Delta badge */}
            <div
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold"
              style={{
                background: isGood ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
                color: isGood ? '#16a34a' : '#dc2626',
              }}
            >
              {isGood ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {isPositive ? '+' : ''}{impact.deltaPercent.toFixed(1)}% {metricLabel(impact.metricType)}
            </div>
          </div>

          {/* Revenue impact */}
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Est. monthly impact</p>
            <p className="text-lg font-bold tabular-nums" style={{ color: '#16a34a' }}>
              {formatCurrency(impact.estimatedRevenueImpactInr)}
            </p>
          </div>
        </div>

        {/* Attribution note */}
        {impact.attributionNotes && (
          <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
            {impact.attributionNotes}
          </p>
        )}
      </div>

      {/* Card footer */}
      {!isDemo && onUndo && (
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ background: 'var(--bg-page)', borderTop: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Clock className="w-3 h-3" />
            Rollback available for 30 days
          </div>
          <button
            onClick={onUndo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-sm"
            style={{
              background: 'rgba(220,38,38,0.06)',
              color: '#dc2626',
              border: '1px solid rgba(220,38,38,0.15)',
            }}
          >
            <Undo2 className="w-3 h-3" />
            Undo Change
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function ImpactLabPage() {
  const { storeId } = useActiveStoreId();
  const { data: apiImpacts, isLoading } = useGetImpactQuery(storeId);
  const [undoChange] = useUndoChangeMutation();
  const [undoingId, setUndoingId] = useState<string | null>(null);

  // Use real data if available, otherwise use demo fallback
  const hasRealData = apiImpacts && apiImpacts.length > 0;
  const impacts: ImpactRecord[] = hasRealData ? apiImpacts : DEMO_IMPACTS;
  const isDemo = !hasRealData;

  // Summary stats
  const totalRevenueImpact = impacts.reduce((sum, i) => sum + i.estimatedRevenueImpactInr, 0);
  const totalChanges = impacts.length;
  const avgLift = impacts.length > 0
    ? impacts.reduce((sum, i) => sum + Math.abs(i.deltaPercent), 0) / impacts.length
    : 0;
  const highConfidence = impacts.filter(i => i.attributionConfidence === 'HIGH').length;

  const handleUndo = async (changeId: string) => {
    setUndoingId(changeId);
    try {
      await undoChange({ changeId });
    } catch (e) {
      console.error('Undo failed', e);
    } finally {
      setUndoingId(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Demo mode banner */}
      {isDemo && (
        <div
          style={{
            background: 'linear-gradient(90deg, #1A1A2E 0%, #2D2D44 100%)',
            borderBottom: '1px solid rgba(108,92,231,0.3)',
          }}
          className="px-6 py-3 flex items-center gap-3"
        >
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-purple-400" />
            <span className="text-xs text-purple-200 font-bold uppercase tracking-wider">Preview Mode</span>
          </div>
          <span className="text-xs text-purple-300/80">
            Showing sample impact data to illustrate how results appear. Run AI Services → approve changes → wait 7 days to see real measured impact.
          </span>
        </div>
      )}

      <div className="px-6 py-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <FlaskConical className="w-5 h-5" style={{ color: 'var(--brand-accent)' }} />
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
                Impact Lab
              </h1>
            </div>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Track the real business impact of every AI-proposed change — before vs. after metrics with attribution confidence.
            </p>
          </div>
          <Link
            href="/autopilot/services"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:-translate-y-0.5 no-underline"
            style={{
              background: 'var(--brand)',
              boxShadow: '0 2px 8px rgba(26,26,46,0.12)',
            }}
          >
            <Zap className="w-4 h-4" />
            Run More Agents
          </Link>
        </div>

        {/* How It Works — step guide */}
        <div
          className="rounded-xl p-5"
          style={{
            background: 'var(--bg-white)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 1px 0 rgba(0,0,0,0.02), 0 1px 8px rgba(0,0,0,0.04)',
          }}
        >
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
            How Impact Tracking Works
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: '1',
                icon: <Zap className="w-4 h-4" />,
                title: 'Run AI Agents',
                desc: 'AI analyzes your products and generates optimization proposals.',
              },
              {
                step: '2',
                icon: <ThumbsUp className="w-4 h-4" />,
                title: 'Approve & Apply',
                desc: 'Review proposals in the queue, then approve to push changes live.',
              },
              {
                step: '3',
                icon: <Activity className="w-4 h-4" />,
                title: 'Measure Impact',
                desc: 'After 7 days, we compare before vs. after metrics automatically.',
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(108,92,231,0.08)', color: 'var(--brand-accent)' }}
                >
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
                    {item.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary strip */}
        <div
          className="rounded-xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4"
          style={{
            background: 'var(--bg-white)',
            border: '1px solid rgba(108,92,231,0.15)',
            boxShadow: '0 1px 0 rgba(0,0,0,0.02), 0 2px 12px rgba(108,92,231,0.06)',
          }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
              Total Revenue Impact
            </p>
            <p className="text-2xl font-bold tabular-nums" style={{ color: '#16a34a' }}>
              {formatCurrency(totalRevenueImpact)}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>estimated monthly across all changes</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
              Changes Measured
            </p>
            <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-heading)' }}>
              {totalChanges}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>applied changes with 7-day tracking</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
              Avg. Metric Lift
            </p>
            <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--brand-accent)' }}>
              +{avgLift.toFixed(1)}%
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>average improvement per change</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
              High Confidence
            </p>
            <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-heading)' }}>
              {highConfidence}/{totalChanges}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>changes with isolated attribution (no confounders)</p>
          </div>
        </div>

        {/* Impact cards */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="rounded-xl h-48 animate-pulse"
                style={{ background: 'var(--bg-muted)' }}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {impacts.map(impact => (
              <ImpactCard
                key={impact.impactId}
                impact={impact}
                isDemo={isDemo}
                onUndo={undoingId === impact.changeId ? undefined : () => handleUndo(impact.changeId)}
              />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div
          className="rounded-xl p-5 flex items-center justify-between"
          style={{
            background: 'rgba(108,92,231,0.03)',
            border: '1px solid rgba(108,92,231,0.1)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(108,92,231,0.08)' }}
            >
              <BarChart3 className="w-5 h-5" style={{ color: 'var(--brand-accent)' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
                Want more data points?
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                More approved changes = more impact measurements. Each tracked change adds to your ROI story.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/autopilot/queue"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all no-underline"
              style={{
                background: 'var(--bg-white)',
                border: '1px solid var(--border-color)',
                color: 'var(--brand-accent)',
              }}
            >
              <Eye className="w-3.5 h-3.5" />
              Review Queue
            </Link>
            <Link
              href="/autopilot/services"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all no-underline"
              style={{
                background: 'var(--brand)',
              }}
            >
              <Zap className="w-3.5 h-3.5" />
              Run Agents
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
