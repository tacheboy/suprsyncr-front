// src/app/onboarding/connect/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, ExternalLink, Package, ShoppingBag, BarChart3 } from 'lucide-react';
import { initDemoStore, addConnectedPlatform } from '@/data/demoStore';

const platforms = [
  { 
    id: 'amazon', 
    name: 'Amazon', 
    letter: 'a', 
    color: '#FF9900',
    description: 'Connect your Amazon Seller Central account',
    authUrl: 'https://sellercentral.amazon.in/apps/authorize/consent'
  },
  { 
    id: 'flipkart', 
    name: 'Flipkart', 
    letter: 'F', 
    color: '#2874F0',
    description: 'Connect your Flipkart Seller Hub',
    authUrl: 'https://seller.flipkart.com/api/oauth/authorize'
  },
  { 
    id: 'meesho', 
    name: 'Meesho', 
    letter: 'M', 
    color: '#E91E63',
    description: 'Connect your Meesho Partner Dashboard',
    authUrl: 'https://partner.meesho.com/oauth/authorize'
  },
  { 
    id: 'shopify', 
    name: 'Shopify', 
    letter: 'S', 
    color: '#96BF48',
    description: 'Connect your Shopify store',
    authUrl: 'https://accounts.shopify.com/oauth/authorize'
  },
  { 
    id: 'woocommerce', 
    name: 'WooCommerce', 
    letter: 'W', 
    color: '#7B51AD',
    description: 'Connect your WooCommerce site',
    authUrl: '#' // Custom integration
  },
  { 
    id: 'blinkit', 
    name: 'Blinkit', 
    letter: 'B', 
    color: '#F8C51C',
    description: 'Connect your Blinkit Seller account',
    authUrl: 'https://seller.blinkit.com/api/oauth'
  },
];

/* ── Syncing animation component ── */
function SyncingOverlay({ platformName, color }: { platformName: string; color: string }) {
  const [progress, setProgress] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [phase, setPhase] = useState<'products' | 'orders' | 'inventory'>('products');

  useEffect(() => {
    // Animate progress from 0 → 100 over ~4 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + 2.5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Tick up product count
    const interval = setInterval(() => {
      setProductCount((prev) => {
        if (prev >= 48) { clearInterval(interval); return 48; }
        return prev + Math.ceil(Math.random() * 4);
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Tick up order count after a short delay
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setOrderCount((prev) => {
          if (prev >= 156) { clearInterval(interval); return 156; }
          return prev + Math.ceil(Math.random() * 8);
        });
      }, 120);
      return () => clearInterval(interval);
    }, 800);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('orders'), 1500);
    const t2 = setTimeout(() => setPhase('inventory'), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 py-1">
      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: `${color}15` }}>
        <div
          className="h-full rounded-full transition-all duration-200 ease-out"
          style={{ width: `${Math.min(progress, 100)}%`, background: color }}
        />
      </div>

      {/* Sync status text */}
      <div className="flex items-center gap-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color }} />
        <span className="text-xs font-medium" style={{ color }}>
          {phase === 'products' && (
            <><Package className="w-3 h-3 inline mr-1" />Syncing products... {Math.min(productCount, 48)}</>
          )}
          {phase === 'orders' && (
            <><ShoppingBag className="w-3 h-3 inline mr-1" />Fetching orders... {Math.min(orderCount, 156)}</>
          )}
          {phase === 'inventory' && (
            <><BarChart3 className="w-3 h-3 inline mr-1" />Importing inventory data...</>
          )}
        </span>
      </div>
    </div>
  );
}

export default function OnboardingConnect() {
  const router = useRouter();
  const [connectedPlatforms, setConnectedPlatforms] = useState<Set<string>>(new Set());
  const [connectingPlatforms, setConnectingPlatforms] = useState<Set<string>>(new Set());
  const [fetchingPlatforms, setFetchingPlatforms] = useState<Set<string>>(new Set());

  const handleConnect = async (platformId: string, authUrl: string) => {
    if (connectedPlatforms.has(platformId) || connectingPlatforms.has(platformId) || fetchingPlatforms.has(platformId)) return;

    // ── Stage 1: OAuth redirect ──
    setConnectingPlatforms(prev => {
      const next = new Set(prev);
      next.add(platformId);
      return next;
    });

    try {
      if (authUrl === '#') {
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        const popup = window.open(
          authUrl,
          'oauth',
          'width=600,height=600,scrollbars=yes,resizable=yes'
        );
        await new Promise(resolve => setTimeout(resolve, 3000));
        if (popup) popup.close();
      }
    } catch (error) {
      console.error('OAuth failed:', error);
    }

    // Clear connecting state
    setConnectingPlatforms(prev => {
      const next = new Set(prev);
      next.delete(platformId);
      return next;
    });

    // ── Stage 2: Fetch data animation ──
    setFetchingPlatforms(prev => {
      const next = new Set(prev);
      next.add(platformId);
      return next;
    });

    try {
      // Initialise the demo store (generates all data once) and register this platform
      initDemoStore();
      addConnectedPlatform(platformId);

      // Show the syncing animation for 4 seconds
      await new Promise(resolve => setTimeout(resolve, 4000));
    } catch (err) {
      console.error('Demo store init failed:', err);
      // Still continue to connected state
    } finally {
      // ── Stage 3: Connected ──
      setFetchingPlatforms(prev => {
        const next = new Set(prev);
        next.delete(platformId);
        return next;
      });

      setConnectedPlatforms(prev => {
        const next = new Set(prev);
        next.add(platformId);
        return next;
      });
    }
  };

  const handleContinue = () => {
    router.push('/dashboard');
  };

  const canContinue = connectedPlatforms.size > 0;

  return (
    <div className="flex-1 flex items-center justify-center py-20 px-6">
      <div className="w-full max-w-2xl">
        {/* Headline */}
        <div className="text-center mb-12">
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--text-heading)', letterSpacing: '-0.4px' }}
          >
            Connect your selling platforms
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            Connect at least one platform to start syncing your data. You can add more later.
          </p>
        </div>

        {/* Platform grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {platforms.map((platform) => {
            const isConnected = connectedPlatforms.has(platform.id);
            const isConnecting = connectingPlatforms.has(platform.id);
            const isFetching = fetchingPlatforms.has(platform.id);
            const isBusy = isConnecting || isFetching;
            
            return (
              <div
                key={platform.id}
                className="relative rounded-xl p-6 transition-all cursor-pointer hover:shadow-md"
                style={{
                  background: 'var(--bg-white)',
                  border: `1px solid ${isConnected ? platform.color : isFetching ? `${platform.color}80` : 'var(--border-color)'}`,
                  boxShadow: isConnected 
                    ? `0 0 0 1px ${platform.color}20, 0 4px 16px rgba(0,0,0,0.08)`
                    : isFetching
                    ? `0 0 0 1px ${platform.color}10, 0 4px 20px rgba(0,0,0,0.06)`
                    : '0 1px 0 rgba(0,0,0,0.02), 0 1px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.02)',
                }}
                onClick={() => !isConnected && !isBusy && handleConnect(platform.id, platform.authUrl)}
              >
                {isConnected && (
                  <div
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: platform.color }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                    style={{ background: platform.color }}
                  >
                    {platform.letter}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base" style={{ color: 'var(--text-heading)' }}>
                      {platform.name}
                    </h3>
                    {isFetching ? (
                      <SyncingOverlay platformName={platform.name} color={platform.color} />
                    ) : (
                      <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {platform.description}
                      </p>
                    )}
                  </div>

                  {!isFetching && (
                    <div className="flex items-center gap-2 shrink-0">
                      {isConnecting ? (
                        <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--brand-accent)' }} />
                      ) : isConnected ? (
                        <span className="text-sm font-medium" style={{ color: platform.color }}>
                          Connected
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--brand-accent)' }}>
                          Connect
                          <ExternalLink className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center space-y-6">
          {canContinue ? (
            <button
              onClick={handleContinue}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-full text-white font-semibold text-base transition-all hover:-translate-y-0.5"
              style={{
                background: 'var(--brand)',
                boxShadow: '0 4px 16px rgba(26, 26, 46, 0.2)',
              }}
            >
              Take me to my dashboard
              <span className="text-lg">→</span>
            </button>
          ) : (
            <div>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Connect at least one platform to continue
              </p>
              <button
                disabled
                className="inline-flex items-center gap-3 px-10 py-4 rounded-full text-white font-semibold text-base opacity-50 cursor-not-allowed"
                style={{ background: 'var(--text-muted)' }}
              >
                Select a platform above
              </button>
            </div>
          )}

          <div>
            <button
              onClick={handleContinue}
              className="text-sm font-medium"
              style={{ color: 'var(--text-muted)' }}
            >
              Skip for now
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mt-20">
          <div className="w-10 h-2 rounded-full" style={{ background: 'var(--brand-accent)' }} />
          <div className="w-10 h-2 rounded-full" style={{ background: 'var(--brand-accent)' }} />
        </div>
        <p className="text-sm mt-4 text-center font-medium" style={{ color: 'var(--text-muted)' }}>
          Step 2 of 2
        </p>
      </div>
    </div>
  );
}
