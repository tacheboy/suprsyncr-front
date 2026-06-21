'use client';

import { useEffect, useState } from 'react';
import { Brain, ImageIcon, Layers, ShieldCheck } from 'lucide-react';

type Phase = {
  icon: typeof Brain;
  label: string;
  detail: string;
};

const PHASES: Phase[] = [
  { icon: ImageIcon,  label: 'Reading the image',
    detail: 'The vision model is identifying the product.' },
  { icon: Brain,      label: 'Planning the listing',
    detail: 'Comparing the identification to your claimed title and store voice.' },
  { icon: Layers,     label: 'Writing the columns',
    detail: 'Copy, SEO and metadata specialists running in parallel.' },
  { icon: ShieldCheck, label: 'Reviewing the output',
    detail: 'Checking the columns ground in the identified product.' },
];

interface StudioRunningCardProps {
  /** Phase auto-advances on a timer; pass an explicit phase to drive it manually. */
  phase?: number;
}

/**
 * Loading card shown while the engine runs (≈4-8s end-to-end).
 *
 * Auto-advances through the four pipeline phases on a timer so the wait
 * feels active and the seller learns what the system actually does. Cheaper
 * than polling for real progress and still honest — the phases match the
 * engine's actual stages (manager → specialists → verifier).
 */
export function StudioRunningCard({ phase }: StudioRunningCardProps) {
  const [internalPhase, setInternalPhase] = useState(0);

  useEffect(() => {
    if (typeof phase === 'number') return;
    const interval = setInterval(() => {
      setInternalPhase((p) => Math.min(p + 1, PHASES.length - 1));
    }, 1800);
    return () => clearInterval(interval);
  }, [phase]);

  const active = typeof phase === 'number' ? phase : internalPhase;

  return (
    <div className="rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-violet-50 p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-violet-900">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-600" />
        </span>
        AI Studio pipeline running
      </div>

      <ol className="space-y-3">
        {PHASES.map((p, i) => {
          const Icon = p.icon;
          const state =
            i < active ? 'done' : i === active ? 'active' : 'pending';
          return (
            <li key={p.label} className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors
                ${state === 'done' ? 'bg-emerald-100 text-emerald-700' : ''}
                ${state === 'active' ? 'bg-violet-600 text-white shadow-sm shadow-violet-200' : ''}
                ${state === 'pending' ? 'bg-slate-100 text-slate-400' : ''}
              `}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    state === 'pending' ? 'text-slate-400' : 'text-slate-900'
                  }`}
                >
                  {p.label}
                </p>
                <p
                  className={`text-xs ${
                    state === 'pending' ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {p.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-5 text-xs text-slate-500">
        Typically completes in 4–8 seconds. Keep this page open.
      </p>
    </div>
  );
}
