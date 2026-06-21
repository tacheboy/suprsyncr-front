'use client';

import { useCallback, useRef, useState } from 'react';
import { ImagePlus, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageDropzoneProps {
  previewUrl: string | null;
  onFile: (file: File) => void;
  onClear?: () => void;
  disabled?: boolean;
}

/**
 * Drag-and-drop (or click) image picker. The visual anchor of the Studio — the
 * seller drops one photo and the AI does the rest. Shows a live preview once a
 * file is chosen.
 */
export function ImageDropzone({ previewUrl, onFile, onClear, disabled }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file && file.type.startsWith('image/')) onFile(file);
    },
    [onFile],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        'group relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors',
        dragging
          ? 'border-violet-400 bg-violet-50'
          : 'border-slate-200 bg-slate-50 hover:border-violet-300 hover:bg-violet-50/40',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {previewUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Selected product"
            className="h-full w-full object-contain p-2"
          />
          {onClear && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-white"
            >
              <RotateCcw className="h-3 w-3" /> Replace
            </button>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600 transition-transform group-hover:scale-105">
            <ImagePlus className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-slate-700">Drop a product photo</p>
          <p className="text-xs text-slate-400">or click to browse · JPG, PNG</p>
        </div>
      )}
    </div>
  );
}
