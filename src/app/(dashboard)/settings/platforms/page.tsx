// src/app/(dashboard)/settings/platforms/page.tsx
'use client';
import { useState } from 'react';
import { useGetPlatformsQuery, useRegisterShopifyWebhooksMutation } from '@/store/services/sellerApi';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus, Check, Edit2, Star, ShoppingBag, Loader2, UserPlus, ExternalLink, BadgeCheck, Webhook } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PLATFORMS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

interface DummyAccount {
  storeName: string;
  sellerId: string;
  rating: number;
  listings: number;
  plan: string;
  joinedDate: string;
}

function generateDummyAccount(platformKey: string, label: string): DummyAccount {
  const prefix = platformKey.slice(0, 3).toUpperCase();
  const id = Math.random().toString(36).substring(2, 10).toUpperCase();
  const plans: Record<string, string> = {
    AMAZON: 'Professional', FLIPKART: 'Advantage', SHOPIFY: 'Basic',
    MEESHO: 'Starter', BLINKIT: 'Partner', MYNTRA: 'Brand Partner',
  };
  const ratings: Record<string, number> = {
    AMAZON: 4.7, FLIPKART: 4.5, SHOPIFY: 5.0,
    MEESHO: 4.6, BLINKIT: 4.8, MYNTRA: 4.3,
  };
  return {
    storeName: `My ${label} Store`,
    sellerId: `${prefix}-${id}`,
    rating: ratings[platformKey] ?? 4.5,
    listings: 0,
    plan: plans[platformKey] ?? 'Standard',
    joinedDate: new Date().toISOString(),
  };
}

export default function PlatformsPage() {
  const { data, isLoading } = useGetPlatformsQuery();
  const [creatingFor, setCreatingFor] = useState<string | null>(null);
  const [createdAccounts, setCreatedAccounts] = useState<Record<string, DummyAccount>>({});
  const [registerWebhooks, { isLoading: registeringWebhooks }] = useRegisterShopifyWebhooksMutation();
  const [webhookResult, setWebhookResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleRegisterWebhooks = async () => {
    setWebhookResult(null);
    try {
      const res = await registerWebhooks().unwrap();
      const registered = res.data?.registered ?? false;
      const hint = res.data?.hint ?? '';
      setWebhookResult({
        ok: registered,
        msg: registered
          ? `Webhooks registered → ${res.data?.webhookEndpoint}`
          : hint || 'Registration skipped — set SHOPIFY_WEBHOOK_BASE_URL to a public HTTPS URL.',
      });
    } catch {
      setWebhookResult({ ok: false, msg: 'Could not reach server. Is the backend running?' });
    }
  };

  const handleCreateAccount = async (platformKey: string, label: string) => {
    setCreatingFor(platformKey);
    await new Promise(resolve => setTimeout(resolve, 2200));
    setCreatedAccounts(prev => ({
      ...prev,
      [platformKey]: generateDummyAccount(platformKey, label),
    }));
    setCreatingFor(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Connections"
        description="Create and manage your seller accounts across all major platforms"
        action={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Platform
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(PLATFORMS).map(([key, config]) => {
            const platformConfig = config as any;
            const connectedPlatform = data?.data?.find((p: any) => p.platformType === key);
            const dummyAccount = createdAccounts[key];
            const isConnected = (!!connectedPlatform && connectedPlatform.isActive !== false) || !!dummyAccount;
            const isCreating = creatingFor === key;

            return (
              <Card
                key={key}
                className={`border-2 transition-all duration-300 ${
                  isConnected
                    ? 'border-green-300 bg-gradient-to-br from-green-50/50 to-emerald-50/30 shadow-green-100 shadow-md'
                    : 'border-slate-200 hover:border-blue-200 hover:shadow-md'
                }`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span className="text-base">{platformConfig.label}</span>
                    {isConnected ? (
                      <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1 shrink-0">
                        <BadgeCheck className="w-3.5 h-3.5" /> Account Active
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-500 rounded-full shrink-0">
                        No Account
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    {platformConfig.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 text-sm pb-4">
                  {isConnected ? (
                    <div className="space-y-2">
                      {/* Store Info */}
                      <div className="bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-slate-900 truncate">
                            {dummyAccount?.storeName || connectedPlatform?.storeName || `${platformConfig.label} Store`}
                          </p>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                        </div>
                        <p className="text-xs text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded">
                          ID: {dummyAccount?.sellerId || connectedPlatform?.externalSellerId || '—'}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white rounded-lg border border-slate-100 p-2 text-center">
                          <div className="flex items-center justify-center gap-0.5 mb-0.5">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-bold text-slate-800">
                              {dummyAccount?.rating ?? connectedPlatform?.rating ?? 4.5}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">Rating</p>
                        </div>
                        <div className="bg-white rounded-lg border border-slate-100 p-2 text-center">
                          <span className="text-sm font-bold text-slate-800 block mb-0.5">
                            {dummyAccount?.listings ?? 0}
                          </span>
                          <p className="text-xs text-slate-400">Listings</p>
                        </div>
                        <div className="bg-white rounded-lg border border-slate-100 p-2 text-center">
                          <Check className="w-3.5 h-3.5 text-green-500 mx-auto mb-0.5" />
                          <p className="text-xs text-slate-400">Active</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 text-center">
                        {dummyAccount?.plan || 'Standard'} plan · Joined{' '}
                        {formatDate(dummyAccount?.joinedDate || connectedPlatform?.connectedAt)}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-center space-y-2">
                      <ShoppingBag className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="text-slate-500 text-xs leading-relaxed">
                        You don&apos;t have a seller account on {platformConfig.label} yet.
                        Create one instantly to start listing your products.
                      </p>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-0 flex flex-col gap-2">
                  {isConnected ? (
                    <>
                      <Button variant="outline" className="w-full text-slate-700 bg-white hover:bg-slate-50 border-slate-200">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Manage Account
                      </Button>
                      {key === 'SHOPIFY' && !!connectedPlatform && (
                        <>
                          <Button
                            variant="outline"
                            className="w-full text-violet-700 border-violet-200 bg-violet-50 hover:bg-violet-100"
                            onClick={handleRegisterWebhooks}
                            disabled={registeringWebhooks}
                          >
                            {registeringWebhooks
                              ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              : <Webhook className="w-4 h-4 mr-2" />}
                            Register Webhooks
                          </Button>
                          {webhookResult && (
                            <p className={`text-xs px-1 ${webhookResult.ok ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {webhookResult.msg}
                            </p>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm shadow-blue-200"
                      onClick={() => handleCreateAccount(key, platformConfig.label)}
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating your account...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Create Seller Account
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
