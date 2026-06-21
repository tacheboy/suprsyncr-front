import { ScanSearch } from 'lucide-react';
import type { StudioDraft } from '@/store/services/studioApi';

export function IdentifiedProductChip({ product }: { product: NonNullable<StudioDraft['identifiedProduct']> }) {
  const identity = [product.brand, product.model || product.title].filter(Boolean).join(' ');

  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm text-violet-900">
      <ScanSearch className="h-4 w-4 shrink-0 text-violet-600" />
      <span className="truncate">
        Image identified as: <strong>{identity || product.title}</strong>
      </span>
      {typeof product.confidence === 'number' && (
        <span className="shrink-0 text-violet-700">{Math.round(product.confidence * (product.confidence <= 1 ? 100 : 1))}%</span>
      )}
    </div>
  );
}
