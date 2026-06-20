// src/app/onboarding/profile/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const categories = [
  'Electronics', 'Fashion', 'Home & Kitchen', 'Beauty',
  'Books', 'Toys', 'Sports', 'Grocery', 'Other',
];

const volumes = [
  { label: '0 – 50', value: 'starter' },
  { label: '50 – 200', value: 'growing' },
  { label: '200 – 1,000', value: 'scaling' },
  { label: '1,000+', value: 'enterprise' },
];

export default function OnboardingProfile() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedVolume, setSelectedVolume] = useState<string | null>(null);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleFinish = () => {
    // In production, save profile to backend
    // For now, go to dashboard
    router.push('/dashboard');
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-10">
          <span
            className="text-2xl font-extrabold"
            style={{ color: 'var(--text-heading)' }}
          >
            Suprsyncr
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--text-heading)', letterSpacing: '-0.4px' }}
          >
            Tell us about your business
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            Helps us personalize your dashboard and AI suggestions.
          </p>
        </div>

        {/* Form */}
        <div
          className="rounded-2xl p-6 mb-8"
          style={{
            background: 'var(--bg-white)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 1px 0 rgba(0,0,0,0.02), 0 1px 8px rgba(0,0,0,0.04)',
          }}
        >
          {/* Business name */}
          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-heading)' }}
            >
              Business name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Priyanshu Traders"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
              style={{
                background: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-heading)',
              }}
            />
          </div>

          {/* Categories */}
          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--text-heading)' }}
            >
              What do you sell?
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const selected = selectedCategories.has(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-all"
                    style={{
                      background: selected ? 'rgba(108, 92, 231, 0.1)' : 'var(--bg-page)',
                      border: selected
                        ? '1px solid var(--brand-accent)'
                        : '1px solid var(--border-color)',
                      color: selected ? 'var(--brand-accent)' : 'var(--text-body)',
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume */}
          <div>
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--text-heading)' }}
            >
              Monthly order volume?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {volumes.map((v) => {
                const selected = selectedVolume === v.value;
                return (
                  <button
                    key={v.value}
                    onClick={() => setSelectedVolume(v.value)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: selected ? 'rgba(108, 92, 231, 0.1)' : 'var(--bg-page)',
                      border: selected
                        ? '1px solid var(--brand-accent)'
                        : '1px solid var(--border-color)',
                      color: selected ? 'var(--brand-accent)' : 'var(--text-body)',
                    }}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={handleFinish}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-base transition-all hover:-translate-y-0.5"
            style={{
              background: 'var(--brand)',
              boxShadow: '0 2px 12px rgba(26, 26, 46, 0.15)',
            }}
          >
            Take me to my dashboard
            <span className="text-lg">→</span>
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mt-12">
          <div className="w-8 h-1.5 rounded-full" style={{ background: 'var(--brand-accent)' }} />
          <div className="w-8 h-1.5 rounded-full" style={{ background: 'var(--brand-accent)' }} />
          <div className="w-8 h-1.5 rounded-full" style={{ background: 'var(--brand-accent)' }} />
        </div>
        <p className="text-xs mt-3 text-center" style={{ color: 'var(--text-faint)' }}>
          Step 3 of 3
        </p>
      </div>
    </div>
  );
}
