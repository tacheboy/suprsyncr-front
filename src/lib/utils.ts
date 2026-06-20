import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency amounts (backend sends as number, e.g. 499.00)
export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format ISO 8601 timestamps from backend
export function formatDate(iso: string | null | undefined, fmt = 'dd MMM yyyy'): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return format(d, fmt);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return format(d, 'dd MMM yyyy, HH:mm');
}

// Truncate long strings for table display
export function truncate(str: string, maxLen = 40): string {
  return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
}

// Get initials for avatar from seller name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}
