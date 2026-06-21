'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface StringListEditorProps {
  label?: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  /** Empty state hint when the list is empty. */
  emptyHint?: string;
  /** Maximum number of items. Add button hides once reached. */
  max?: number;
}

/**
 * Inline editor for arrays of short strings (bullets, tags, search terms).
 * Renders each item as a removable chip and an inline "add new" input.
 * No drag-reorder in MVP — keeps the surface quiet and predictable.
 */
export function StringListEditor({
  label,
  values,
  onChange,
  placeholder = 'Add…',
  emptyHint,
  max,
}: StringListEditorProps) {
  const [draft, setDraft] = useState('');
  const atLimit = typeof max === 'number' && values.length >= max;

  const commit = () => {
    const v = draft.trim();
    if (!v || atLimit) return;
    onChange([...values, v]);
    setDraft('');
  };

  const remove = (idx: number) => {
    onChange(values.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-xs font-medium text-slate-600">{label}</p>}

      <div className="flex flex-wrap gap-1.5">
        {values.length === 0 && emptyHint && (
          <p className="text-xs italic text-slate-400">{emptyHint}</p>
        )}
        {values.map((v, i) => (
          <Badge
            key={`${v}-${i}`}
            variant="secondary"
            className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-normal"
          >
            <span className="max-w-[18rem] truncate">{v}</span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="rounded-full text-slate-400 hover:text-slate-700"
              aria-label={`Remove ${v}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      {!atLimit && (
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commit();
              }
            }}
            placeholder={placeholder}
            className="h-9"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={commit}
            disabled={!draft.trim()}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
