// src/components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, AI_ITEMS, SETTINGS_ITEMS } from '@/lib/constants';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Warehouse,
  Globe,
  Tag,
  User,
  Building,
  Plug,
  Sparkles,
  Wand2,
  TrendingUp,
  MessageSquare,
  Zap,
  BarChart3,
} from 'lucide-react';

const iconMap = {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Warehouse,
  Globe,
  Tag,
  User,
  Building,
  Plug,
  Sparkles,
  Wand2,
  TrendingUp,
  MessageSquare,
  Zap,
  BarChart3,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-64 h-screen sticky top-0 flex flex-col z-40 transition-all"
      style={{
        background: 'var(--bg-white)',
        borderRight: '1px solid var(--border-color)',
      }}
    >
      {/* Logo */}
      <div className="p-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <Link href="/dashboard" className="flex items-center gap-0 no-underline">
          <span
            className="text-xl font-extrabold"
            style={{ color: 'var(--text-heading)' }}
          >
            S
          </span>
          <span
            className="text-xl font-extrabold"
            style={{ color: 'var(--text-heading)', letterSpacing: '-0.3px' }}
          >
            uprsyncr
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-l-2 no-underline',
                isActive
                  ? 'border-l-2'
                  : 'border-transparent'
              )}
              style={
                isActive
                  ? {
                      background: 'var(--bg-muted)',
                      color: 'var(--text-heading)',
                      borderLeftColor: 'var(--brand)',
                    }
                  : {
                      color: 'var(--text-body)',
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-muted)';
                  e.currentTarget.style.color = 'var(--text-heading)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-body)';
                }
              }}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}

        <div
          className="my-4"
          style={{ height: '1px', background: 'var(--border-color)' }}
        />

        <div
          className="px-3 py-2 text-xs font-bold uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          AI Tools
        </div>

        {AI_ITEMS.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-l-2 no-underline',
                isActive
                  ? 'border-l-2'
                  : 'border-transparent'
              )}
              style={
                isActive
                  ? {
                      background: 'rgba(108, 92, 231, 0.08)',
                      color: 'var(--brand-accent)',
                      borderLeftColor: 'var(--brand-accent)',
                    }
                  : {
                      color: 'var(--text-body)',
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(108, 92, 231, 0.05)';
                  e.currentTarget.style.color = 'var(--brand-accent)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-body)';
                }
              }}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}

        <div
          className="my-4"
          style={{ height: '1px', background: 'var(--border-color)' }}
        />

        <div
          className="px-3 py-2 text-xs font-bold uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          Settings
        </div>

        {SETTINGS_ITEMS.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-l-2 no-underline',
                isActive
                  ? 'border-l-2'
                  : 'border-transparent'
              )}
              style={
                isActive
                  ? {
                      background: 'var(--bg-muted)',
                      color: 'var(--text-heading)',
                      borderLeftColor: 'var(--brand)',
                    }
                  : {
                      color: 'var(--text-body)',
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-muted)';
                  e.currentTarget.style.color = 'var(--text-heading)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-body)';
                }
              }}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
