'use client';

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div
      className="rounded-2xl border animate-pulse overflow-hidden"
      style={{ background: 'var(--bg-white)', borderColor: 'var(--border-color)' }}
    >
      <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="h-4 rounded w-1/3" style={{ background: 'var(--bg-muted)' }} />
      </div>
      <div className="p-6 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded"
            style={{ background: 'var(--bg-muted)', width: `${75 - i * 8}%` }}
          />
        ))}
      </div>
    </div>
  );
}
