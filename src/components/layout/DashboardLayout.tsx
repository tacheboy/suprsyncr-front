// src/components/layout/DashboardLayout.tsx
'use client';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen relative overflow-hidden" style={{ background: 'var(--bg-page)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 animate-fade-in custom-scrollbar">{children}</main>
      </div>
    </div>
  );
}
