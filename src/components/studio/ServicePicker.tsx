'use client';

import { FileText, Search, Tags } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import type { StudioServices } from '@/store/services/studioApi';

interface ServicePickerProps {
  value: StudioServices;
  onChange: (next: StudioServices) => void;
  disabled?: boolean;
}

const SERVICES: {
  key: keyof StudioServices;
  icon: typeof FileText;
  label: string;
  description: string;
}[] = [
  {
    key: 'product',
    icon: FileText,
    label: 'Product optimisation',
    description: 'A clean title, benefit-led bullets and a sales description — written to match your store’s voice.',
  },
  {
    key: 'seo',
    icon: Search,
    label: 'SEO optimisation',
    description: 'A search-friendly URL handle, tags, buyer search terms and meta title/description.',
  },
  {
    key: 'platform',
    icon: Tags,
    label: 'Platform metadata',
    description: 'Catalogue fields the marketplace needs: product type, vendor and structured attributes.',
  },
];

/**
 * Lets the seller pick which of the three Studio services to run. Each runs an
 * independent specialist, so unchecking one means we don't spend a model call
 * on work the seller doesn't want. At least one must stay selected.
 */
export function ServicePicker({ value, onChange, disabled }: ServicePickerProps) {
  const selectedCount = Object.values(value).filter(Boolean).length;

  const toggle = (key: keyof StudioServices) => {
    // Keep at least one service on.
    if (value[key] && selectedCount === 1) return;
    onChange({ ...value, [key]: !value[key] });
  };

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {SERVICES.map(({ key, icon: Icon, label, description }) => {
        const on = value[key];
        return (
          <button
            key={key}
            type="button"
            disabled={disabled}
            onClick={() => toggle(key)}
            className={cn(
              'flex flex-col gap-2 rounded-lg border p-3 text-left transition-all',
              on
                ? 'border-violet-300 bg-violet-50/60 ring-1 ring-violet-200'
                : 'border-slate-200 bg-white hover:border-slate-300',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md',
                  on ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500',
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <Checkbox checked={on} className="pointer-events-none" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{label}</p>
              <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
