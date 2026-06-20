// src/app/(dashboard)/listings/page.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Upload,
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  UserPlus,
  Plug,
  TrendingUp,
  ShoppingBag,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

/* ============================================================
   TYPES
   ============================================================ */
interface PlatformSuggestion {
  key: string;
  name: string;
  color: string;
  bgGrad: string;
  emoji: string;
  matchPct: number;
  reason: string;
  category: string;
  sellerIdPrefix: string;
  plan: string;
}

type AccountStatus = 'idle' | 'creating' | 'done';

interface CreatedAccount {
  sellerId: string;
  plan: string;
}

interface ModalState {
  platform: PlatformSuggestion | null;
  open: boolean;
  step: 'form' | 'creating' | 'success';
  sellerId: string;
}

/* ============================================================
   CONSTANTS
   ============================================================ */
const ALL_PLATFORMS: PlatformSuggestion[] = [
  {
    key: 'AMAZON',
    name: 'Amazon',
    color: '#FF9900',
    bgGrad: 'linear-gradient(135deg,#FF9900,#e67e00)',
    emoji: 'A',
    matchPct: 94,
    reason: 'High demand for this category',
    category: 'Top Performer',
    sellerIdPrefix: 'AMZ',
    plan: 'Professional',
  },
  {
    key: 'FLIPKART',
    name: 'Flipkart',
    color: '#2874F0',
    bgGrad: 'linear-gradient(135deg,#2874F0,#1a5cc4)',
    emoji: 'F',
    matchPct: 87,
    reason: 'Strong buyer base in India',
    category: 'High Traffic',
    sellerIdPrefix: 'FK',
    plan: 'Advantage',
  },
  {
    key: 'MEESHO',
    name: 'Meesho',
    color: '#6C5CE7',
    bgGrad: 'linear-gradient(135deg,#6C5CE7,#5348c4)',
    emoji: 'M',
    matchPct: 76,
    reason: 'Low fee, high social reach',
    category: 'Zero Commission',
    sellerIdPrefix: 'MSH',
    plan: 'Starter',
  },
  {
    key: 'SHOPIFY',
    name: 'Shopify',
    color: '#96BF48',
    bgGrad: 'linear-gradient(135deg,#96BF48,#7aaa2c)',
    emoji: 'S',
    matchPct: 71,
    reason: 'Best for branded storefronts',
    category: 'Brand Builder',
    sellerIdPrefix: 'SHP',
    plan: 'Basic',
  },
];

const MOCK_PRODUCTS = [
  { name: 'Wireless Bluetooth Earbuds', category: 'Electronics' },
  { name: 'Casual Cotton T-Shirt', category: 'Apparel' },
  { name: 'Stainless Steel Water Bottle', category: 'Kitchen & Home' },
  { name: 'Running Shoes', category: 'Footwear' },
  { name: 'Organic Face Moisturizer', category: 'Beauty & Personal Care' },
  { name: 'Leather Wallet', category: 'Accessories' },
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function generateSellerId(prefix: string): string {
  return `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;
}
function matchColor(pct: number) {
  if (pct >= 90) return '#15803D';
  if (pct >= 80) return '#1D4ED8';
  if (pct >= 70) return '#B45309';
  return '#6B7280';
}
function matchBg(pct: number) {
  if (pct >= 90) return '#DCFCE7';
  if (pct >= 80) return '#DBEAFE';
  if (pct >= 70) return '#FEF3C7';
  return '#F3F4F6';
}

/* ============================================================
   ACCOUNT CREATION MODAL
   ============================================================ */
function AccountModal({
  modal,
  user,
  onClose,
  onSuccess,
}: {
  modal: ModalState;
  user: { fullName: string; email: string } | null;
  onClose: () => void;
  onSuccess: (platformKey: string, sellerId: string, plan: string) => void;
}) {
  const p = modal.platform;
  const [businessName, setBusinessName] = useState(
    user?.fullName ? `${user.fullName}'s Store` : ''
  );
  const [gstin, setGstin] = useState('');
  const [bank, setBank] = useState('');

  if (!modal.open || !p) return null;

  const handleCreate = async () => {
    onSuccess(p.key, '__creating__', p.plan);
    await new Promise((r) => setTimeout(r, 2200));
    onSuccess(p.key, generateSellerId(p.sellerIdPrefix), p.plan);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px', backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: '20px', maxWidth: '460px',
          width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.18)', overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: p.bgGrad, padding: '24px 28px 20px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 800,
              }}>{p.emoji}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17 }}>Create {p.name} Seller Account</div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>{p.plan} plan · Free to create</div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)', border: 'none',
                borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#fff',
              }}
            ><X size={16} /></button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px' }}>
          {modal.step === 'success' ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: 64, height: 64, background: '#DCFCE7', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              }}>
                <CheckCircle2 size={32} color="#16A34A" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Account Created! 🎉</h3>
              <p style={{ color: '#64748B', fontSize: 14, margin: '0 0 20px' }}>
                Your {p.name} seller account is live and synced with Suprsyncr.
              </p>
              <div style={{
                background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12,
                padding: '16px', textAlign: 'left', marginBottom: 20,
              }}>
                <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>Seller ID</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16 }}>{modal.sellerId}</div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 8 }}>Plan</div>
                <div style={{ fontWeight: 600 }}>{p.plan}</div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: '100%', padding: '12px', background: p.bgGrad,
                  border: 'none', borderRadius: 10, color: '#fff',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                }}
              >Done — Start Listing</button>
            </div>
          ) : modal.step === 'creating' ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: p.color }} />
              <p style={{ marginTop: 16, fontWeight: 600, color: '#1E293B' }}>
                Setting up your {p.name} account…
              </p>
              <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 6 }}>
                Mapping your info · Registering seller ID · Activating plan
              </p>
            </div>
          ) : (
            <>
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                background: '#EFF6FF', border: '1px solid #BFDBFE',
                borderRadius: 10, padding: '12px 14px', marginBottom: 20,
              }}>
                <BadgeCheck size={18} color="#2563EB" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: '#1D4ED8', margin: 0, lineHeight: 1.5 }}>
                  Your <strong>name</strong> and <strong>email</strong> are already filled in from your Suprsyncr account.
                </p>
              </div>

              <div style={{ display: 'grid', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                    Full Name <span style={{ background: '#DCFCE7', color: '#166534', fontSize: 11, padding: '2px 7px', borderRadius: 4, marginLeft: 4 }}>Auto-filled</span>
                  </label>
                  <input value={user?.fullName ?? ''} readOnly style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, background: '#F8FAFC', color: '#64748B', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                    Email <span style={{ background: '#DCFCE7', color: '#166534', fontSize: 11, padding: '2px 7px', borderRadius: 4, marginLeft: 4 }}>Auto-filled</span>
                  </label>
                  <input value={user?.email ?? ''} readOnly style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, background: '#F8FAFC', color: '#64748B', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Store / Business Name</label>
                  <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. My Fashion Store" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>GSTIN</label>
                    <input value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="22XXXXX1234Z5" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Bank Account</label>
                    <input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="XXXX XXXX 1234" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13, boxSizing: 'border-box' }} />
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreate}
                style={{
                  width: '100%', padding: '13px', background: p.bgGrad,
                  border: 'none', borderRadius: 10, color: '#fff',
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <UserPlus size={17} />
                Create {p.name} Seller Account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   AI SMART LISTING PANEL (collapsible)
   ============================================================ */
function SmartListingPanel({ user }: { user: { fullName: string; email: string } | null }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [detectedProduct, setDetectedProduct] = useState<{ name: string; category: string } | null>(null);
  const [suggestions, setSuggestions] = useState<PlatformSuggestion[]>([]);
  const [accountStatuses, setAccountStatuses] = useState<Record<string, AccountStatus>>(
    Object.fromEntries(ALL_PLATFORMS.map((p) => [p.key, 'idle']))
  );
  const [createdAccounts, setCreatedAccounts] = useState<Record<string, CreatedAccount>>({});
  const [modal, setModal] = useState<ModalState>({ platform: null, open: false, step: 'form', sellerId: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageUrl(URL.createObjectURL(file));
    setAnalyzing(true);
    setDetectedProduct(null);
    setSuggestions([]);
    await new Promise((r) => setTimeout(r, 1800));
    setDetectedProduct(randomItem(MOCK_PRODUCTS));
    setSuggestions([...ALL_PLATFORMS].sort((a, b) => b.matchPct - a.matchPct));
    setAnalyzing(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const reset = () => {
    setImageUrl(null);
    setDetectedProduct(null);
    setSuggestions([]);
    setAnalyzing(false);
    setAccountStatuses(Object.fromEntries(ALL_PLATFORMS.map((p) => [p.key, 'idle'])));
    setCreatedAccounts({});
  };

  const openModal = (platform: PlatformSuggestion) => {
    if (accountStatuses[platform.key] === 'done') return;
    setModal({ platform, open: true, step: 'form', sellerId: '' });
  };

  const handleModalSuccess = (platformKey: string, sellerId: string, plan: string) => {
    if (sellerId === '__creating__') {
      setModal((m) => ({ ...m, step: 'creating' }));
      setAccountStatuses((prev) => ({ ...prev, [platformKey]: 'creating' }));
    } else {
      setModal((m) => ({ ...m, step: 'success', sellerId }));
      setAccountStatuses((prev) => ({ ...prev, [platformKey]: 'done' }));
      setCreatedAccounts((prev) => ({ ...prev, [platformKey]: { sellerId, plan } }));
    }
  };

  return (
    <>
      {/* Collapsible trigger card */}
      <div
        style={{
          background: expanded ? '#EEF2FF' : '#fff',
          border: `1.5px solid ${expanded ? '#A5B4FC' : '#E2E8F0'}`,
          borderRadius: 14,
          overflow: 'hidden',
          transition: 'all 0.2s',
        }}
      >
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, background: '#EEF2FF', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={19} color="#6366F1" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1E293B' }}>
                ✨ AI Smart Listing — Upload & List Instantly
              </div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                Drop a product photo → get platform suggestions → create accounts or connect
              </div>
            </div>
          </div>
          {expanded ? <ChevronUp size={18} color="#6366F1" /> : <ChevronDown size={18} color="#94A3B8" />}
        </button>

        {/* Expanded body */}
        {expanded && (
          <div style={{ borderTop: '1px solid #E0E7FF', padding: '20px', background: '#fff' }}>

            {/* Upload zone */}
            {!imageUrl ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? '#6366F1' : '#CBD5E1'}`,
                  borderRadius: 14, padding: '40px 24px', textAlign: 'center',
                  cursor: 'pointer',
                  background: dragOver ? '#EEF2FF' : '#FAFAFA',
                  transition: 'all 0.2s',
                }}
              >
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
                <div style={{ width: 56, height: 56, background: '#EEF2FF', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <Upload size={26} color="#6366F1" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', margin: '0 0 6px' }}>Drop your product photo here</h3>
                <p style={{ color: '#64748B', fontSize: 13, margin: '0 0 16px' }}>AI analyzes the image and suggests the best platforms to list on</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 20px', background: '#6366F1', color: '#fff', borderRadius: 9, fontSize: 13, fontWeight: 600 }}>
                  <Upload size={14} /> Choose Image
                </div>
                <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 10 }}>PNG, JPG, WEBP · Max 10MB</p>
              </div>
            ) : (
              <>
                {/* Preview + detection */}
                <div style={{ display: 'flex', gap: 18, marginBottom: 20, alignItems: 'flex-start' }}>
                  <div style={{ width: 100, height: 100, borderRadius: 12, overflow: 'hidden', border: '1px solid #E2E8F0', flexShrink: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    {analyzing ? (
                      <div style={{ paddingTop: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <Loader2 size={18} color="#6366F1" style={{ animation: 'spin 1s linear infinite' }} />
                          <span style={{ fontWeight: 600, color: '#6366F1', fontSize: 14 }}>Analyzing product…</span>
                        </div>
                        <p style={{ fontSize: 12, color: '#94A3B8' }}>Detecting category · Scanning demand signals · Matching platforms</p>
                      </div>
                    ) : detectedProduct ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <Sparkles size={14} color="#F59E0B" />
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#92400E', background: '#FEF3C7', padding: '2px 8px', borderRadius: 20 }}>AI Detected</span>
                        </div>
                        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>{detectedProduct.name}</h3>
                        <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 12px' }}>Category: <strong>{detectedProduct.category}</strong></p>
                        <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: 7, background: '#fff', cursor: 'pointer', fontSize: 12, color: '#64748B' }}>
                          <X size={12} /> Try another image
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Platform suggestion cards */}
                {suggestions.length > 0 && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <TrendingUp size={16} color="#6366F1" />
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Best Platforms to List On</span>
                      <span style={{ fontSize: 11, background: '#EEF2FF', color: '#4F46E5', padding: '2px 9px', borderRadius: 20, fontWeight: 600 }}>AI Suggested</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12, marginBottom: 16 }}>
                      {suggestions.map((platform) => {
                        const status = accountStatuses[platform.key];
                        const account = createdAccounts[platform.key];
                        return (
                          <div key={platform.key} style={{ border: `1.5px solid ${status === 'done' ? '#86EFAC' : '#E2E8F0'}`, borderRadius: 14, overflow: 'hidden', background: status === 'done' ? 'linear-gradient(145deg,#F0FDF4,#fff)' : '#fff' }}>
                            <div style={{ background: platform.bgGrad, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff' }}>{platform.emoji}</div>
                                <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{platform.name}</span>
                              </div>
                              <div style={{ background: matchBg(platform.matchPct), color: matchColor(platform.matchPct), fontWeight: 700, fontSize: 12, padding: '3px 8px', borderRadius: 20 }}>
                                {platform.matchPct}%
                              </div>
                            </div>
                            <div style={{ padding: '12px 14px' }}>
                              <p style={{ fontSize: 11, color: '#64748B', margin: '0 0 10px', lineHeight: 1.4 }}>{platform.reason}</p>
                              {status === 'done' && account ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 8px', background: '#DCFCE7', borderRadius: 7 }}>
                                    <CheckCircle2 size={13} color="#16A34A" />
                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#15803D' }}>Account Active</span>
                                  </div>
                                  <div style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'monospace', background: '#F8FAFC', padding: '3px 7px', borderRadius: 5 }}>{account.sellerId}</div>
                                </div>
                              ) : status === 'creating' ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0' }}>
                                  <Loader2 size={14} color="#6366F1" style={{ animation: 'spin 1s linear infinite' }} />
                                  <span style={{ fontSize: 12, color: '#6366F1', fontWeight: 500 }}>Creating…</span>
                                </div>
                              ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                  <button onClick={() => router.push('/settings/platforms')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '7px 4px', border: '1.5px solid #E2E8F0', borderRadius: 7, background: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#475569' }}>
                                    <Plug size={11} /> Connect
                                  </button>
                                  <button onClick={() => openModal(platform)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '7px 4px', border: 'none', borderRadius: 7, background: platform.bgGrad, cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#fff' }}>
                                    <UserPlus size={11} /> Create
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ padding: '12px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <ShoppingBag size={15} color="#6366F1" style={{ flexShrink: 0, marginTop: 1 }} />
                      <p style={{ fontSize: 12, color: '#475569', margin: 0, lineHeight: 1.5 }}>
                        <strong>Connect</strong> links an existing account · <strong>Create</strong> opens a new seller account using your Suprsyncr profile — no extra forms needed.
                      </p>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <AccountModal modal={modal} user={user} onClose={() => setModal((m) => ({ ...m, open: false }))} onSuccess={handleModalSuccess} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

/* ============================================================
   MAIN PAGE — preserves original flow, adds Smart Listing panel
   ============================================================ */
export default function ListingsPage() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="space-y-6">
      {/* ── Original header with Create Listing button ── */}
      <PageHeader
        title="Listings"
        description="Manage product listings across platforms"
        action={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Listing
          </Button>
        }
      />

      {/* ── NEW: AI Smart Listing — collapsible, non-intrusive ── */}
      <SmartListingPanel user={user} />

      {/* ── Original listings table / coming soon area ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500">
          Listings management coming soon. Connect platforms first.
        </p>
      </div>
    </div>
  );
}
