// src/app/connect-shopify/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, ExternalLink, RefreshCw, AlertCircle, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { initDemoStore, addConnectedPlatform } from '@/data/demoStore';
import styles from './page.module.css';

// Sync step interface
interface SyncStep {
  id: number;
  label: string;
  subLabel?: string;
  status: 'idle' | 'syncing' | 'completed';
}

export default function ConnectShopifyPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Component states
  const [shopInput, setShopInput] = useState('');
  const [step, setStep] = useState<'input' | 'oauth-pending' | 'syncing' | 'success'>('input');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const popupRef = useRef<Window | null>(null);

  // Sync Checklist items
  const [syncSteps, setSyncSteps] = useState<SyncStep[]>([
    { id: 1, label: 'Authenticating with Shopify App API', status: 'idle' },
    { id: 2, label: 'Syncing product catalog and images', subLabel: 'Syncing 48 products...', status: 'idle' },
    { id: 3, label: 'Mapping active inventory and warehouses', status: 'idle' },
    { id: 4, label: 'Importing historical sales and client data', subLabel: 'Syncing 156 orders...', status: 'idle' },
    { id: 5, label: 'Seeding AI price-elasticity analytics engine', status: 'idle' },
  ]);

  // Clean domain input helper
  const getCleanShopDomain = (input: string): string => {
    let clean = input.trim().toLowerCase();
    
    // Remove protocol prefixes if they exist
    clean = clean.replace(/^(https?:\/\/)?(www\.)?/, '');
    
    // Remove slash paths
    clean = clean.split('/')[0] || '';
    
    // Auto-append .myshopify.com if it's just the subdomain
    if (clean && !clean.includes('.')) {
      clean += '.myshopify.com';
    }
    
    return clean;
  };

  const cleanDomain = getCleanShopDomain(shopInput);
  const isValidDomain = cleanDomain.length > 3 && cleanDomain.endsWith('.myshopify.com') && !cleanDomain.includes(' ');

  // Listen to popup postMessage message events from backend callback
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      // Ensure we verify message contents
      if (event.data && event.data.type === 'shopify-connected') {
        if (event.data.success) {
          // Popup successfully finished OAuth! Close popup if open
          if (popupRef.current) {
            popupRef.current.close();
          }
          startDataSync(false);
        } else {
          setErrorMessage(event.data.error || 'Failed to authenticate with Shopify.');
          setStep('input');
        }
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  // Handles real Shopify Connection OAuth popup
  const handleConnectShopify = () => {
    if (!isValidDomain) {
      setErrorMessage('Please enter a valid Shopify store domain.');
      return;
    }

    setErrorMessage(null);
    setStep('oauth-pending');
    setIsDemo(false);

    // Launch authorization popup tab
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const authUrl = `${apiBaseUrl}/api/v1/shopify/auth?shop=${cleanDomain}${token ? `&token=${token}` : ''}`;
    
    const width = 600;
    const height = 750;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      authUrl,
      'shopify-oauth',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );

    popupRef.current = popup;

    // Direct fallback poll just in case postMessage fails
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        // If popup closed but we are still in pending, check if connected or show helper
        setTimeout(() => {
          setStep((currentStep) => {
            if (currentStep === 'oauth-pending') {
              toast({
                title: 'Authorization Pending',
                description: 'The popup window was closed. If authorization succeeded, wait for syncing to begin, or click reconnect.',
              });
              return 'input';
            }
            return currentStep;
          });
        }, 1000);
      }
    }, 1500);
  };

  // Re-open authorization tab if closed prematurely
  const handleReopenPopup = () => {
    handleConnectShopify();
  };

  // Handles Demo Mode connection simulation
  const handleConnectDemo = () => {
    setErrorMessage(null);
    setIsDemo(true);
    startDataSync(true);
  };

  // Triggers sequential mock data synchronizer timeline
  const startDataSync = (isDemoModeActive: boolean) => {
    setStep('syncing');

    // Reset sync steps to idle/pending
    setSyncSteps((prev) => prev.map((s) => ({ ...s, status: 'idle' })));

    let currentIndex = 0;

    const executeNextStep = () => {
      if (currentIndex >= syncSteps.length) {
        // All sync tasks completed, proceed to success screen
        setTimeout(() => {
          // Initialize localized demo data state if running in demo mode
          if (isDemoModeActive) {
            initDemoStore();
            addConnectedPlatform('shopify');
          }
          setStep('success');
          // Navigate to main dashboard console
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        }, 1000);
        return;
      }

      // Mark current item as active syncing
      setSyncSteps((prev) =>
        prev.map((step, idx) => {
          if (idx === currentIndex) return { ...step, status: 'syncing' };
          return step;
        })
      );

      // Duration of each sync element animation simulation
      const delay = currentIndex === 1 || currentIndex === 3 ? 1800 : 1200;

      setTimeout(() => {
        // Mark current item as completed
        setSyncSteps((prev) =>
          prev.map((step, idx) => {
            if (idx === currentIndex) return { ...step, status: 'completed' };
            return step;
          })
        );
        currentIndex++;
        executeNextStep();
      }, delay);
    };

    // Begin sequence
    executeNextStep();
  };

  return (
    <div className={styles.wrapper}>
      {/* Background glow blobs */}
      <div className={styles.glowBlob1} />
      <div className={styles.glowBlob2} />

      <div className={styles.container}>
        {/* Step Indicator Header */}
        <div className={styles.header}>
          <div className={styles.brand}>⚡ Suprsyncr</div>
          <div className={styles.stepBadge}>Onboarding · D2C Connection</div>
        </div>

        {/* Dynamic Card States */}
        <div className={styles.card}>
          
          {/* STATE 1: Domain Input Form */}
          {step === 'input' && (
            <div className={styles.fadeContent}>
              <h1 className={styles.title}>Connect your Shopify Store</h1>
              <p className={styles.subText}>
                Link your Shopify backend to sync listings, inventory channels, and historical orders with our real-time AI command center.
              </p>

              {errorMessage && (
                <div className={styles.errorAlert}>
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className={styles.inputGroup}>
                <label className={styles.label}>Shopify Store URL</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    value={shopInput}
                    onChange={(e) => setShopInput(e.target.value)}
                    placeholder="e.g. your-store-name.myshopify.com"
                    className={`${styles.input} ${isValidDomain ? styles.inputValid : ''}`}
                    onKeyDown={(e) => e.key === 'Enter' && isValidDomain && handleConnectShopify()}
                  />
                  <div className={styles.inputIndicator}>
                    {isValidDomain ? (
                      <Check className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <span className={styles.subdomainHint}>.myshopify.com</span>
                    )}
                  </div>
                </div>
                <p className={styles.inputHelp}>
                  Enter either your clean shopify subdomain (e.g. <code>my-shop</code>) or full myshopify URL.
                </p>
              </div>

              <div className={styles.actionRow}>
                <button
                  onClick={handleConnectShopify}
                  disabled={!isValidDomain}
                  className={styles.connectBtn}
                >
                  <span>Connect Store</span>
                  <ExternalLink className="w-4 h-4 ml-2" />
                </button>

                <div className={styles.divider}>
                  <span>or</span>
                </div>

                <button
                  onClick={handleConnectDemo}
                  className={styles.demoBtn}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  <span>Launch Interactive Sandbox Demo</span>
                </button>
              </div>

              <div className={styles.trustFooter}>
                🔒 Fully secured OAuth standard integration. SUPRSYNCR never stores your raw shop credentials.
              </div>
            </div>
          )}

          {/* STATE 2: OAuth Tab Pending */}
          {step === 'oauth-pending' && (
            <div className={styles.fadeContent}>
              <div className={styles.logoFlow}>
                <div className={styles.logoItem}>⚡</div>
                <div className={styles.logoConnector}>
                  <div className={styles.logoConnectorLine} />
                </div>
                <div className={styles.logoItemShopify}>S</div>
              </div>

              <h2 className={styles.stateTitle}>Awaiting Shopify Authorization</h2>
              <p className={styles.subText}>
                We opened a new window tab to authorize the SUPRSYNCR connector app for your store <strong>{cleanDomain}</strong>. Please complete the installation there.
              </p>

              <div className={styles.pendingActionBox}>
                <div className={styles.pendingSpinner}>
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                  <span>Waiting for callback handshake...</span>
                </div>

                <div className={styles.pendingButtons}>
                  <button onClick={handleReopenPopup} className={styles.secondaryActionBtn}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Re-open Authorization Tab
                  </button>
                  <button onClick={() => setStep('input')} className={styles.backBtn}>
                    Cancel
                  </button>
                </div>
              </div>

              <div className={styles.popupTroubleshoot}>
                💡 <strong>Don't see a popup window?</strong> Make sure your browser's popup blocker isn't disabling new tabs for our page.
              </div>
            </div>
          )}

          {/* STATE 3: Syncing Progress Screen */}
          {step === 'syncing' && (
            <div className={styles.fadeContent}>
              <h2 className={styles.stateTitle}>Synchronizing Store Channels</h2>
              <p className={styles.subText}>
                Hang tight! We are compiling active listings, fetching local inventory details, and preparing the AI analytical modeling maps for {isDemo ? 'Sandbox Demo Store' : cleanDomain}.
              </p>

              <div className={styles.syncChecklist}>
                {syncSteps.map((s) => (
                  <div
                    key={s.id}
                    className={`${styles.syncItem} ${
                      s.status === 'completed'
                        ? styles.syncCompleted
                        : s.status === 'syncing'
                        ? styles.syncActive
                        : styles.syncIdle
                    }`}
                  >
                    <div className={styles.syncIconContainer}>
                      {s.status === 'completed' ? (
                        <div className={styles.checkDone}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : s.status === 'syncing' ? (
                        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      ) : (
                        <div className={styles.dotIdle} />
                      )}
                    </div>
                    <div className={styles.syncItemContent}>
                      <div className={styles.syncLabel}>{s.label}</div>
                      {s.subLabel && s.status === 'syncing' && (
                        <div className={styles.syncSubLabel}>{s.subLabel}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.syncIndicatorBar}>
                <div className={styles.syncIndicatorActive} />
              </div>
            </div>
          )}

          {/* STATE 4: Successful Onboarding Transition */}
          {step === 'success' && (
            <div className={`${styles.fadeContent} text-center py-6`}>
              <div className={styles.successGlow}>
                <div className={styles.successIcon}>✓</div>
              </div>

              <h2 className={styles.stateTitle}>Shopify Store Synced!</h2>
              <p className={styles.subText}>
                Your store connection verified successfully. Initializing main operational workspace...
              </p>

              <div className={styles.successRedirect}>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Launching dashboard workspace
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
