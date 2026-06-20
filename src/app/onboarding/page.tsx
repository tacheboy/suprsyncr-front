// src/app/onboarding/page.tsx
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

export default function OnboardingStart() {
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

  const handleContinue = () => {
    // In production, save profile to backend
    // For now, proceed to platform connections
    router.push('/onboarding/connect');
  };

  const isValid = businessName.trim().length > 0 && selectedCategories.size > 0 && selectedVolume;

  return (
    <div className="flex-1 flex items-center justify-center py-20 px-6">
      <div className="w-full max-w-lg">
        {/* Headline */}
        <div className="text-center mb-12">
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--text-heading)', letterSpacing: '-0.4px' }}
          >
            Tell us about your business
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            Let's get your store set up in under 2 minutes.
          </p>
        </div>

        {/* Form */}
        <div
          className="rounded-2xl p-8 mb-10"
          style={{
            background: 'var(--bg-white)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 1px 0 rgba(0,0,0,0.02), 0 1px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.02)',
          }}
        >
          {/* Business name */}
          <div className="mb-8">
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--text-heading)' }}
            >
              Business name *
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Priyanshu Traders"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
              style={{
                background: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-heading)',
              }}
            />
          </div>

          {/* Categories */}
          <div className="mb-8">
            <label
              className="block text-sm font-medium mb-4"
              style={{ color: 'var(--text-heading)' }}
            >
              What do you sell? *
            </label>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => {
                const selected = selectedCategories.has(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all"
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
              className="block text-sm font-medium mb-4"
              style={{ color: 'var(--text-heading)' }}
            >
              Monthly order volume? *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {volumes.map((v) => {
                const selected = selectedVolume === v.value;
                return (
                  <button
                    key={v.value}
                    onClick={() => setSelectedVolume(v.value)}
                    className="px-4 py-3 rounded-xl text-sm font-medium transition-all"
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
        <div className="text-center mb-16">
          <button
            onClick={handleContinue}
            disabled={!isValid}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-full text-white font-semibold text-base transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{
              background: isValid ? 'var(--brand)' : 'var(--text-muted)',
              boxShadow: isValid ? '0 4px 16px rgba(26, 26, 46, 0.2)' : 'none',
            }}
          >
            Continue to Platforms
            <span className="text-lg">→</span>
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mt-16">
          <div className="w-10 h-2 rounded-full" style={{ background: 'var(--brand-accent)' }} />
          <div className="w-10 h-2 rounded-full" style={{ background: 'var(--bg-muted)' }} />
        </div>
        <p className="text-sm mt-4 text-center font-medium" style={{ color: 'var(--text-muted)' }}>
          Step 1 of 2
        </p>
      </div>
    </div>
  );
}
