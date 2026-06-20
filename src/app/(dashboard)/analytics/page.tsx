'use client';

import { useState } from 'react';
import { RefreshCw, Store, Wifi } from 'lucide-react';
import { useGetDummyStoresQuery, useRefreshAllAnalyticsMutation } from '@/store/services/analyticsApi';
import { RevenuLeakCard } from './components/RevenuLeakCard';
import { ProductHealthMatrix } from './components/ProductHealthMatrix';
import { SeoGapCard } from './components/SeoGapCard';

export default function AnalyticsPage() {
  const [selectedStore, setSelectedStore] = useState('store-a');

  const { data: storesData, isLoading: storesLoading } = useGetDummyStoresQuery();
  const [refreshAll, { isLoading: refreshing }] = useRefreshAllAnalyticsMutation();

  const stores = storesData?.stores ?? [];
  const selectedStoreData = stores.find(s => s.storeId === selectedStore);

  // Show demo banner only when backend reports dummy data source.
  // When Phase 5 OAuth connects a real store, dataSource becomes 'live' and banner disappears.
  const isDemoMode = !storesData || storesData.dataSource !== 'live';

  const handleRefresh = async () => {
    try {
      await refreshAll(selectedStore).unwrap();
    } catch (e) {
      console.error('Refresh failed', e);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Demo Mode Banner — hidden when dataSource === 'live' (Phase 5 OAuth) */}
      {isDemoMode && (
        <div style={{
          background: 'linear-gradient(90deg, #1A1A2E 0%, #2D2D44 100%)',
          borderBottom: '1px solid rgba(108,92,231,0.3)',
        }} className="px-6 py-2 flex items-center gap-2">
          <Wifi className="h-3.5 w-3.5 text-purple-400" />
          <span className="text-xs text-purple-300 font-medium">
            Demo Mode — Connect your store to see real data
          </span>
          <span className="ml-auto text-xs text-slate-500">dataSource: dummy</span>
        </div>
      )}

      <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
              Analytics
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Diagnostic + prescription engine — raw data → rupee-denominated action items
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Store selector */}
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
              <select
                value={selectedStore}
                onChange={e => setSelectedStore(e.target.value)}
                disabled={storesLoading}
                className="pl-9 pr-4 py-2 text-sm rounded-lg border appearance-none cursor-pointer"
                style={{
                  background: 'var(--bg-white)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-body)',
                  outline: 'none',
                }}
              >
                {stores.map(s => (
                  <option key={s.storeId} value={s.storeId}>{s.storeName}</option>
                ))}
              </select>
            </div>

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all"
              style={{
                background: refreshing ? 'var(--bg-muted)' : 'var(--bg-white)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-body)',
              }}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing…' : 'Refresh + AI'}
            </button>
          </div>
        </div>

        {/* Store context pill */}
        {selectedStoreData && (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-medium border"
              style={{ background: 'var(--bg-white)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
              {selectedStoreData.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium border"
              style={{ background: 'var(--bg-white)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
              {selectedStoreData.monthlyTraffic.toLocaleString()} monthly visitors
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium border"
              style={{ background: 'var(--bg-white)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
              ₹{selectedStoreData.avgOrderValue.toLocaleString()} avg order
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium border capitalize"
              style={{ background: 'var(--bg-white)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
              {selectedStoreData.primaryTrafficSource}-primary
            </span>
          </div>
        )}

        {/* Phase 1 — Revenue Leak */}
        <RevenuLeakCard storeId={selectedStore} />

        {/* Phase 2 — Product Health Matrix */}
        <ProductHealthMatrix storeId={selectedStore} />

        {/* Phase 3 — SEO Gap */}
        <SeoGapCard storeId={selectedStore} />
      </div>
    </div>
  );
}
