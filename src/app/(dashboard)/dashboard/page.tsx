// src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useGetOrderStatisticsQuery, useGetOrdersQuery } from '@/store/services/orderApi';
import { useGetLowStockQuery } from '@/store/services/inventoryApi';
import { useGetWeeklyInsightQuery } from '@/store/services/aiApi';
import { useGetPlatformsQuery } from '@/store/services/sellerApi';
import { useAppSelector } from '@/store/hooks';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PlatformBadge } from '@/components/shared/PlatformBadge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ShoppingBag, TrendingUp, Package, AlertTriangle,
  Sparkles, ArrowRight, Lightbulb, Store,
  Link2, CheckCircle2, Zap, BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const today = new Date();
const thirtyDaysAgo = new Date(today);
thirtyDaysAgo.setDate(today.getDate() - 30);

/* ── tiny helpers ─── */
function greetByTime(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ══════════════════════════════════════════════════════
   EMPTY STATE — shown when no platforms are connected
   ══════════════════════════════════════════════════════ */
function EmptyDashboard() {
  const platforms = [
    { name: 'Amazon',      color: '#FF9900' },
    { name: 'Flipkart',    color: '#2874F0' },
    { name: 'Shopify',     color: '#96BF48' },
    { name: 'Meesho',      color: '#E91E63' },
    { name: 'WooCommerce', color: '#7B51AD' },
    { name: 'Blinkit',     color: '#F8C51C' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-16 animate-fade-in">
      {/* Icon cluster */}
      <div className="relative mb-8">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(108, 92, 231, 0.08)' }}
        >
          <Store className="w-10 h-10" style={{ color: 'var(--brand-accent)' }} />
        </div>
        <div
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center border-2"
          style={{
            background: 'var(--bg-white)',
            borderColor: 'var(--border-color)',
          }}
        >
          <Link2 className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>

      <h2
        className="text-xl font-bold mb-2"
        style={{ color: 'var(--text-heading)', letterSpacing: '-0.3px' }}
      >
        Connect your first store
      </h2>
      <p
        className="text-sm max-w-md mb-8"
        style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}
      >
        Suprsyncr syncs orders, inventory and listings across every marketplace.
        Connect a store to unlock your dashboard.
      </p>

      {/* Platform pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {platforms.map((p) => (
          <div
            key={p.name}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{
              background: 'var(--bg-white)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-body)',
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: p.color }}
            />
            {p.name}
          </div>
        ))}
      </div>

      <Link href="/onboarding">
        <button
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-white font-semibold transition-all hover:-translate-y-0.5"
          style={{
            background: 'var(--brand)',
            boxShadow: '0 2px 12px rgba(26, 26, 46, 0.15)',
          }}
        >
          <Link2 className="w-4 h-4" />
          Get Started
        </button>
      </Link>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   NEEDS ATTENTION CARD — returns / pending / low stock
   ══════════════════════════════════════════════════════ */
function NeedsAttentionCard({
  pendingOrders,
  lowStockCount,
}: {
  pendingOrders: number;
  lowStockCount: number;
}) {
  const items: { label: string; count: number; color: string; icon: React.ReactNode; href: string }[] = [];

  if (pendingOrders > 0) {
    items.push({
      label: 'Pending orders',
      count: pendingOrders,
      color: 'var(--color-warning)',
      icon: <Package className="w-4 h-4" />,
      href: '/orders',
    });
  }
  if (lowStockCount > 0) {
    items.push({
      label: 'Low stock items',
      count: lowStockCount,
      color: '#EF4444',
      icon: <AlertTriangle className="w-4 h-4" />,
      href: '/inventory',
    });
  }

  if (items.length === 0) {
    return (
      <div
        className="rounded-xl p-4 flex items-center gap-3"
        style={{
          background: 'rgba(22, 163, 74, 0.06)',
          border: '1px solid rgba(22, 163, 74, 0.15)',
        }}
      >
        <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: 'var(--color-success)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>
          All caught up — nothing needs your attention right now.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{
        background: 'var(--bg-white)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.02), 0 1px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
          Needs Attention
        </span>
      </div>
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex items-center justify-between py-2 px-3 rounded-lg transition-colors hover:opacity-80"
          style={{ background: 'var(--bg-page)' }}
        >
          <div className="flex items-center gap-2.5" style={{ color: item.color }}>
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{
              color: item.color,
              background: `${item.color}14`,
            }}
          >
            {item.count}
          </span>
        </Link>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   FULL DASHBOARD — shown when stores are connected
   ══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const firstName = user?.fullName?.split(' ')[0] ?? 'there';

  const { data: platforms, isLoading: platformsLoading } = useGetPlatformsQuery();
  const hasPlatforms = (platforms?.data?.length ?? 0) > 0;

  const { data: stats, isLoading: statsLoading } = useGetOrderStatisticsQuery(
    {
      startDate: thirtyDaysAgo.toISOString().split('T')[0] ?? '',
      endDate: today.toISOString().split('T')[0] ?? '',
    },
    { skip: !hasPlatforms },
  );

  const { data: recentOrders } = useGetOrdersQuery(
    { page: 0, size: 5 },
    { skip: !hasPlatforms },
  );

  const { data: lowStock } = useGetLowStockQuery(undefined, {
    skip: !hasPlatforms,
  });

  const { data: weeklyInsights, isLoading: insightsLoading } = useGetWeeklyInsightQuery(
    undefined,
    { skip: !hasPlatforms },
  );

  const s = stats?.data;

  /* ── Loading skeleton ── */
  if (platformsLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  /* ── Empty state ── */
  if (!hasPlatforms) {
    return <EmptyDashboard />;
  }

  /* ── Stat cards ── */
  const statCards = [
    {
      label: 'Total Revenue',
      value: s ? formatCurrency(s.totalRevenue) : '—',
      icon: TrendingUp,
      accent: 'var(--color-success)',
      bg: 'rgba(22, 163, 74, 0.08)',
    },
    {
      label: 'Total Orders',
      value: s?.totalOrders ?? '—',
      icon: ShoppingBag,
      accent: 'var(--brand-accent)',
      bg: 'rgba(108, 92, 231, 0.08)',
    },
    {
      label: 'Pending Orders',
      value: s?.pendingOrders ?? '—',
      icon: Package,
      accent: 'var(--color-warning)',
      bg: 'rgba(217, 119, 6, 0.08)',
    },
    {
      label: 'Low Stock',
      value: lowStock?.data?.length ?? '—',
      icon: AlertTriangle,
      accent: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.08)',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
          {greetByTime()}, {firstName}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Last 30 days overview &middot;{' '}
          <span className="font-medium" style={{ color: 'var(--brand-accent)' }}>
            {platforms?.data?.length} store{(platforms?.data?.length ?? 0) > 1 ? 's' : ''} connected
          </span>
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl p-5"
            style={{
              background: 'var(--bg-white)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 1px 0 rgba(0,0,0,0.02), 0 1px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: 'var(--text-muted)' }}
              >
                {card.label}
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: card.bg }}
              >
                <card.icon className="w-4 h-4" style={{ color: card.accent }} />
              </div>
            </div>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
                {String(card.value)}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Needs Attention */}
      <NeedsAttentionCard
        pendingOrders={s?.pendingOrders ?? 0}
        lowStockCount={lowStock?.data?.length ?? 0}
      />

      {/* AI Services Quick Access */}
      <div
        className="rounded-xl p-5"
        style={{
          background: 'var(--bg-white)',
          border: '1px solid rgba(108, 92, 231, 0.15)',
          boxShadow: '0 1px 0 rgba(0,0,0,0.02), 0 1px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: 'var(--brand-accent)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
              AI Autopilot Services
            </h2>
          </div>
          <Link
            href="/autopilot/services"
            className="text-xs font-medium flex items-center gap-1"
            style={{ color: 'var(--brand-accent)' }}
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'SEO Optimizer', desc: 'Fix keyword gaps', href: '/autopilot/services' },
            { label: 'Listing Doctor', desc: 'Improve conversions', href: '/autopilot/services' },
            { label: 'Cart Recovery', desc: 'Reduce abandonment', href: '/autopilot/services' },
            { label: 'Pricing Tests', desc: 'Maximize revenue', href: '/autopilot/services' },
          ].map((svc) => (
            <Link
              key={svc.label}
              href={svc.href}
              className="rounded-lg p-3 transition-all hover:shadow-md"
              style={{ background: 'rgba(108, 92, 231, 0.04)', border: '1px solid rgba(108, 92, 231, 0.1)' }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>
                {svc.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {svc.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Recent Orders (2 cols) ── */}
        <div className="lg:col-span-2 space-y-6">
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: 'var(--bg-white)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 1px 0 rgba(0,0,0,0.02), 0 1px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--border-color)' }}
            >
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
                Recent Orders
              </h2>
              <Link
                href="/orders"
                className="text-xs font-medium"
                style={{ color: 'var(--brand-accent)' }}
              >
                View all →
              </Link>
            </div>

            {recentOrders?.data?.content && recentOrders.data.content.length > 0 ? (
              <div>
                {recentOrders.data.content.map((order) => (
                  <div
                    key={order.id}
                    className="px-5 py-3 flex items-center justify-between transition-colors"
                    style={{ borderBottom: '1px solid var(--bg-muted)' }}
                  >
                    <div className="flex items-center gap-3">
                      <PlatformBadge platform={order.platformType} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>
                          #{order.externalOrderId}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {order.customerName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={order.status} type="order" />
                      <span
                        className="text-sm font-semibold font-mono"
                        style={{ color: 'var(--text-heading)' }}
                      >
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center">
                <ShoppingBag className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-faint)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Orders will appear here once your connected stores sync.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: AI Insights + Quick Actions (1 col) ── */}
        <div className="space-y-6">
          {/* AI widget */}
          <div
            className="rounded-xl overflow-hidden relative"
            style={{
              background: 'var(--bg-white)',
              border: '1px solid rgba(108, 92, 231, 0.15)',
              boxShadow: '0 1px 0 rgba(0,0,0,0.02), 0 1px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full" style={{ background: 'rgba(108, 92, 231, 0.05)' }} />
            <div
              className="px-5 py-4 flex items-center gap-2"
              style={{
                borderBottom: '1px solid rgba(108, 92, 231, 0.1)',
                background: 'rgba(108, 92, 231, 0.03)',
              }}
            >
              <Sparkles className="w-5 h-5" style={{ color: 'var(--brand-accent)' }} />
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
                AI Business Insights
              </h2>
            </div>
            <div className="p-5 relative z-10">
              {insightsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : weeklyInsights?.data?.actionItems && weeklyInsights.data.actionItems.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                    Top recommendations for{' '}
                    {weeklyInsights.data.periodStart
                      ? new Date(weeklyInsights.data.periodStart).toLocaleDateString()
                      : 'this week'}
                  </p>
                  {weeklyInsights.data.actionItems.slice(0, 3).map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-3 items-start rounded-lg p-3 transition-colors"
                      style={{
                        background: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--brand-accent)' }} />
                      <div>
                        <p className="text-sm leading-snug font-medium" style={{ color: 'var(--text-heading)' }}>
                          {item.action}
                        </p>
                        <p
                          className="text-[10px] mt-1 uppercase tracking-wider font-semibold"
                          style={{ color: 'var(--brand-accent)' }}
                        >
                          Impact: {item.expectedImpact}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4">
                    <Link href="/ai/insights" className="block w-full">
                      <button
                        className="w-full py-2.5 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 transition-all"
                        style={{
                          background: 'var(--brand-accent)',
                          boxShadow: '0 1px 6px rgba(108, 92, 231, 0.2)',
                        }}
                      >
                        View Full Report
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ background: 'rgba(108, 92, 231, 0.08)' }}
                  >
                    <Sparkles className="w-6 h-6" style={{ color: 'var(--brand-accent)' }} />
                  </div>
                  <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
                    Your weekly insights are being prepared.
                  </p>
                  <Link href="/ai/insights">
                    <button
                      className="w-full py-2.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: 'var(--bg-page)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--brand-accent)',
                      }}
                    >
                      Go to AI Hub
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="rounded-xl p-5"
            style={{
              background: 'var(--bg-white)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 1px 0 rgba(0,0,0,0.02), 0 1px 8px rgba(0,0,0,0.04)',
            }}
          >
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <Zap className="w-4 h-4" style={{ color: 'var(--brand-accent)' }} />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: '/ai/product-studio', icon: Sparkles, label: 'Product Studio', accent: 'var(--brand-accent)' },
                { href: '/products', icon: Package, label: 'My Products', accent: 'var(--brand-accent)' },
                { href: '/ai/chat', icon: Lightbulb, label: 'Ask AI', accent: 'var(--color-warning)' },
                { href: '/analytics', icon: BarChart3, label: 'Analytics', accent: 'var(--color-success)' },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="group flex flex-col items-center justify-center gap-2 p-3 rounded-lg transition-colors"
                  style={{
                    background: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <a.icon className="w-5 h-5 transition-transform group-hover:scale-110" style={{ color: a.accent }} />
                  <span className="text-xs font-medium text-center" style={{ color: 'var(--text-body)' }}>
                    {a.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
