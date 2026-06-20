'use client';

import { useState } from 'react';
import { useActiveStoreId } from '@/hooks/useActiveStoreId';
import {
  useGetServicesPreviewQuery,
  useTriggerServiceRunMutation,
  useTriggerRunMutation,
} from '@/store/services/autopilotApi';
import { useGetProductsQuery } from '@/store/services/productApi';
import {
  Search, FileText, ShoppingCart, DollarSign, Users, Zap, Loader2, CheckCircle2, ArrowRight,
  ChevronDown, ChevronUp, Check, Info,
} from 'lucide-react';
import Link from 'next/link';

interface ServiceConfig {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  agentParam: string;
}

const SERVICES: ServiceConfig[] = [
  {
    key: 'seo',
    title: 'SEO Commander',
    description: 'Optimize meta titles & descriptions for keywords ranking 8–20 positions',
    icon: <Search className="w-6 h-6" />,
    agentParam: 'seo',
  },
  {
    key: 'listing',
    title: 'Listing Doctor',
    description: 'CRO optimization for high-traffic, low-conversion products',
    icon: <FileText className="w-6 h-6" />,
    agentParam: 'listing',
  },
  {
    key: 'cart_recovery',
    title: 'Cart Recovery',
    description: 'Inject trust signals for products with high cart abandonment',
    icon: <ShoppingCart className="w-6 h-6" />,
    agentParam: 'cart_recovery',
  },
  {
    key: 'pricing',
    title: 'Pricing Strategist',
    description: 'Price ceiling A/B tests for top-performing products',
    icon: <DollarSign className="w-6 h-6" />,
    agentParam: 'pricing',
  },
  {
    key: 'competitor_intel',
    title: 'Competitor Intel',
    description: 'Market research & category benchmarks against top sellers',
    icon: <Users className="w-6 h-6" />,
    agentParam: 'competitor_intel',
  },
];

type RunState = 'idle' | 'running' | 'complete';

export default function ServicesPage() {
  const { storeId } = useActiveStoreId();
  const { data: preview, isLoading: previewLoading } = useGetServicesPreviewQuery(storeId);
  const [triggerServiceRun] = useTriggerServiceRunMutation();
  const [triggerFullRun] = useTriggerRunMutation();

  // Fetch active store products for selection
  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery({
    page: 0,
    size: 100,
    status: 'ACTIVE',
  });
  const products = productsData?.data?.content || [];

  const [runStates, setRunStates] = useState<Record<string, RunState>>({});
  const [fullRunState, setFullRunState] = useState<RunState>('idle');

  // Product Selection States
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isPickerExpanded, setIsPickerExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleRunService = async (agentParam: string) => {
    setRunStates((prev) => ({ ...prev, [agentParam]: 'running' }));
    try {
      await triggerServiceRun({
        storeId,
        agents: [agentParam],
        productIds: selectedProductIds.length > 0 ? selectedProductIds : undefined,
      });
      setRunStates((prev) => ({ ...prev, [agentParam]: 'complete' }));
    } catch {
      setRunStates((prev) => ({ ...prev, [agentParam]: 'idle' }));
    }
  };

  const handleRunAll = async () => {
    setFullRunState('running');
    try {
      await triggerFullRun(storeId);
      setFullRunState('complete');
    } catch {
      setFullRunState('idle');
    }
  };

  const getPreviewText = (key: string): string => {
    if (!preview) return '';
    const p = preview as any;
    const data = p[key];
    if (!data || !data.available) return 'No data yet';
    switch (key) {
      case 'seo':
        return `${data.opportunityCount} keyword opportunities${data.topKeyword ? ` · Top: "${data.topKeyword}"` : ''}`;
      case 'listing':
        return `${data.problemProductCount} products need optimization${data.topProductName ? ` · "${data.topProductName}"` : ''}`;
      case 'pricing':
        return `${data.winnerCount} winner products ready for price tests`;
      case 'cart_recovery':
        return `₹${(data.totalLeakINR ?? 0).toLocaleString()} revenue leak · ${((data.abandonmentRate ?? 0) * 100).toFixed(0)}% abandonment`;
      case 'competitor_intel':
        return 'Generate category benchmarks for your products';
      default:
        return '';
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
            AI Services
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Run individual agents or the full pipeline. Proposals go to your approval queue.
          </p>
        </div>
        <button
          onClick={handleRunAll}
          disabled={fullRunState === 'running'}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-all disabled:opacity-50"
          style={{ background: 'var(--brand)' }}
        >
          {fullRunState === 'running' ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Running All...</>
          ) : fullRunState === 'complete' ? (
            <><CheckCircle2 className="w-4 h-4" /> Complete</>
          ) : (
            <><Zap className="w-4 h-4" /> Run Full Pipeline</>
          )}
        </button>
      </div>

      {/* Product Selection / Scope Run Section */}
      <div
        className="rounded-xl border transition-all"
        style={{
          background: 'var(--bg-white)',
          borderColor: 'var(--border-color)',
          boxShadow: '0 1px 0 rgba(0,0,0,0.02), 0 1px 8px rgba(0,0,0,0.04)',
        }}
      >
        <button
          onClick={() => setIsPickerExpanded(!isPickerExpanded)}
          className="w-full flex items-center justify-between p-4 font-semibold text-sm focus:outline-none"
          style={{ color: 'var(--text-heading)' }}
        >
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded text-xs font-semibold transition-colors"
              style={{
                background: selectedProductIds.length > 0 ? 'rgba(108, 92, 231, 0.1)' : 'var(--bg-page)',
                color: selectedProductIds.length > 0 ? 'var(--brand-accent)' : 'var(--text-muted)',
              }}
            >
              {selectedProductIds.length > 0 ? `${selectedProductIds.length} Selected` : 'All Products'}
            </span>
            <span>Scope Service Runs to Specific Products (Optional)</span>
          </div>
          {isPickerExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {isPickerExpanded && (
          <div className="p-4 border-t border-dashed" style={{ borderColor: 'var(--border-color)' }}>
            {/* Search and Quick Options */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  style={{
                    background: 'var(--bg-page)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-heading)',
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const allIds = products.map((p: any) => p.id.toString());
                    setSelectedProductIds(allIds);
                  }}
                  className="px-3 py-2 rounded-lg border text-xs font-medium hover:bg-slate-50 transition-colors"
                  style={{
                    background: 'var(--bg-white)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-heading)',
                  }}
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedProductIds([])}
                  className="px-3 py-2 rounded-lg border text-xs font-medium hover:bg-slate-50 transition-colors"
                  style={{
                    background: 'var(--bg-white)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-heading)',
                  }}
                >
                  Clear Selection
                </button>
              </div>
            </div>

            {/* Product list */}
            {productsLoading ? (
              <div className="flex items-center justify-center py-6 gap-2 text-sm text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-400">No active products found matching search query.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                {filteredProducts.map((product: any) => {
                  const isSelected = selectedProductIds.includes(product.id.toString());
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleToggleProduct(product.id.toString())}
                      className="flex items-center justify-between p-2.5 rounded-lg border text-left text-xs font-medium transition-all"
                      style={{
                        background: isSelected ? 'rgba(108, 92, 231, 0.04)' : 'var(--bg-white)',
                        borderColor: isSelected ? 'var(--brand-accent)' : 'var(--border-color)',
                        color: 'var(--text-heading)',
                      }}
                    >
                      <div className="truncate pr-2">
                        <div className="font-semibold truncate">{product.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{product.sku}</div>
                      </div>
                      <div
                        className="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                        style={{
                          background: isSelected ? 'var(--brand-accent)' : 'transparent',
                          borderColor: isSelected ? 'var(--brand-accent)' : 'var(--border-color)',
                          color: 'white',
                        }}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
              <Info className="w-3.5 h-3.5" />
              <span>Selected products will override the automatic orchestration and force agents to analyze ONLY these items.</span>
            </div>
          </div>
        )}
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICES.map((service) => {
          const state = runStates[service.agentParam] || 'idle';
          return (
            <div
              key={service.key}
              className="rounded-xl p-5 flex flex-col justify-between"
              style={{
                background: 'var(--bg-white)',
                border: '1px solid var(--border-color)',
                boxShadow: '0 1px 0 rgba(0,0,0,0.02), 0 1px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(108, 92, 231, 0.08)', color: 'var(--brand-accent)' }}
                  >
                    {service.icon}
                  </div>
                  <h3 className="font-semibold" style={{ color: 'var(--text-heading)' }}>
                    {service.title}
                  </h3>
                </div>
                <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                  {service.description}
                </p>
                {/* Preview */}
                {!previewLoading && (
                  <p className="text-xs font-medium mb-4" style={{ color: 'var(--brand-accent)' }}>
                    {getPreviewText(service.key)}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleRunService(service.agentParam)}
                disabled={state === 'running'}
                className="w-full mt-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border disabled:opacity-50"
                style={
                  state === 'complete'
                    ? { background: 'rgba(22, 163, 74, 0.08)', borderColor: 'rgba(22, 163, 74, 0.3)', color: '#16a34a' }
                    : { background: 'var(--bg-page)', borderColor: 'var(--border-color)', color: 'var(--text-heading)' }
                }
              >
                {state === 'running' ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Running...
                  </span>
                ) : state === 'complete' ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Done — View Queue
                  </span>
                ) : (
                  'Run Agent'
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Link to queue */}
      {(fullRunState === 'complete' || Object.values(runStates).includes('complete')) && (
        <div className="text-center pt-4">
          <Link
            href="/autopilot/queue"
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
            style={{ color: 'var(--brand-accent)' }}
          >
            View Approval Queue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
