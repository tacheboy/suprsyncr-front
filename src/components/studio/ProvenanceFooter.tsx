import { Cpu, Wallet, Gauge } from 'lucide-react';
import type { StudioDraft } from '@/store/services/studioApi';

interface ProvenanceFooterProps {
  draft: Pick<StudioDraft, 'modelPath' | 'costInr' | 'confidence' | 'planReasoning'>;
}

/**
 * Small, unobtrusive footer that earns trust without competing with the
 * primary CTA: shows which models ran, what they cost, and the manager's
 * confidence in the identification.
 */
export function ProvenanceFooter({ draft }: ProvenanceFooterProps) {
  const items: { icon: typeof Cpu; label: string; value: string }[] = [];

  if (draft.modelPath) {
    items.push({ icon: Cpu, label: 'Models', value: draft.modelPath });
  }
  if (typeof draft.costInr === 'number') {
    items.push({
      icon: Wallet,
      label: 'Cost',
      value: `₹${draft.costInr.toFixed(2)}`,
    });
  }
  if (typeof draft.confidence === 'number') {
    items.push({
      icon: Gauge,
      label: 'Confidence',
      value: `${Math.round(draft.confidence * 100)}%`,
    });
  }

  if (items.length === 0) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-400">{label}:</span>
            <span className="font-mono text-slate-700">{value}</span>
          </div>
        ))}
      </div>
      {draft.planReasoning && (
        <p className="mt-2 text-xs leading-5 text-slate-500">
          <span className="font-medium text-slate-600">Plan:</span> {draft.planReasoning}
        </p>
      )}
    </div>
  );
}
