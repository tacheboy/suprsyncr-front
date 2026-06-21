import { AlertTriangle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { StudioDraft } from '@/store/services/studioApi';

interface MismatchBannerProps {
  warning: NonNullable<StudioDraft['mismatchWarning']>;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  attention?: boolean;
}

export function MismatchBanner({ warning, checked, onCheckedChange, attention = false }: MismatchBannerProps) {
  return (
    <div
      className={`rounded-lg border bg-amber-50 p-4 transition-shadow ${
        attention ? 'border-amber-500 ring-2 ring-amber-300' : 'border-amber-200'
      }`}
    >
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-amber-950">Image and claimed title do not match</p>
          <p className="mt-1 text-sm leading-6 text-amber-900">
            You typed <strong>{warning.seller_claim}</strong> but the image looks like{' '}
            <strong>{warning.identified}</strong>. Recommended action: {warning.recommendation}.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Checkbox
              id="accept-mismatch-override"
              checked={checked}
              onCheckedChange={(value) => onCheckedChange(value === true)}
            />
            <Label htmlFor="accept-mismatch-override" className="cursor-pointer text-sm font-medium text-amber-950">
              I confirm I want to publish anyway
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
