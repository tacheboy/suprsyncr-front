'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AttributesEditorProps {
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}

/**
 * Friendly key/value editor for product metadata attributes.
 *
 * The Studio engine produces a free-form attributes map (e.g. { storage: "128GB",
 * color: "gold" }). Rendering that as a raw JSON textarea works but is noise —
 * sellers shouldn't have to know what JSON is. This component renders each
 * entry as an inline pair of inputs with a remove button, plus a single "add
 * entry" row. Values are stored as strings here; numeric coercion is left to
 * the backend where it has a typed Shopify destination.
 */
export function AttributesEditor({ value, onChange }: AttributesEditorProps) {
  const entries = Object.entries(value);
  const [draftKey, setDraftKey] = useState('');
  const [draftVal, setDraftVal] = useState('');

  const updateEntry = (oldKey: string, newKey: string, newVal: string) => {
    const next: Record<string, unknown> = {};
    for (const [k, v] of entries) {
      if (k === oldKey) {
        if (newKey.trim()) next[newKey] = newVal;
        // dropping the key (empty) effectively removes it
      } else {
        next[k] = v;
      }
    }
    onChange(next);
  };

  const remove = (key: string) => {
    const next = { ...value };
    delete next[key];
    onChange(next);
  };

  const addEntry = () => {
    const k = draftKey.trim();
    if (!k) return;
    onChange({ ...value, [k]: draftVal });
    setDraftKey('');
    setDraftVal('');
  };

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        {entries.length === 0 && (
          <p className="text-xs italic text-slate-400">
            No attributes yet — add what the buyer needs to see (e.g. size, color, storage).
          </p>
        )}
        {entries.map(([key, val]) => (
          <div key={key} className="flex items-center gap-2">
            <Input
              defaultValue={key}
              onBlur={(e) => updateEntry(key, e.target.value, String(val ?? ''))}
              className="h-9 max-w-[10rem] text-xs"
              aria-label="Attribute key"
            />
            <span className="text-xs text-slate-400">:</span>
            <Input
              defaultValue={String(val ?? '')}
              onBlur={(e) => updateEntry(key, key, e.target.value)}
              className="h-9 flex-1 text-xs"
              aria-label="Attribute value"
            />
            <button
              type="button"
              onClick={() => remove(key)}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label={`Remove ${key}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
        <Input
          value={draftKey}
          onChange={(e) => setDraftKey(e.target.value)}
          placeholder="key"
          className="h-9 max-w-[10rem] text-xs"
        />
        <span className="text-xs text-slate-400">:</span>
        <Input
          value={draftVal}
          onChange={(e) => setDraftVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addEntry();
            }
          }}
          placeholder="value"
          className="h-9 flex-1 text-xs"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addEntry}
          disabled={!draftKey.trim()}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
