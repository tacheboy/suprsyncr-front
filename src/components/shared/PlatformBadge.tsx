// src/components/shared/PlatformBadge.tsx

import { cn } from '@/lib/utils';

const PLATFORM_STYLES: Record<string, string> = {
  SHOPIFY: 'bg-green-100 text-green-800',
  BLINKIT: 'bg-yellow-100 text-yellow-800',
  WOOCOMMERCE: 'bg-purple-100 text-purple-800',
};

export function PlatformBadge({ platform }: { platform: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold',
        PLATFORM_STYLES[platform] ?? 'bg-slate-100 text-slate-700'
      )}
    >
      {platform}
    </span>
  );
}
