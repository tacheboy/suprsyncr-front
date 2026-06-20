// src/components/shared/PageHeader.tsx

import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--text-heading)' }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--text-muted)' }}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
