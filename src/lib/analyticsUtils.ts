// src/lib/analyticsUtils.ts
// Utility functions for Analytics Frontend Completion
// Formatting functions for currency, position, and date display

/**
 * Format currency amounts with Indian locale (₹XX,XXX.XX format)
 * @param amount - The numeric amount to format
 * @returns Formatted currency string with ₹ symbol and Indian grouping
 * 
 * Examples:
 * - formatCurrency(1234567) => "₹12,34,567"
 * - formatCurrency(0) => "₹0"
 * - formatCurrency(1234.56) => "₹1,235"
 */
export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) {
    return '₹0';
  }
  
  // Round to nearest integer and format with Indian locale
  const rounded = Math.round(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);
}

/**
 * Format search position with one decimal digit (Pos X.Y format)
 * @param position - The numeric position value
 * @returns Formatted position string
 * 
 * Examples:
 * - formatPosition(12.456) => "Pos 12.5"
 * - formatPosition(8) => "Pos 8.0"
 * - formatPosition(3.14) => "Pos 3.1"
 */
export function formatPosition(position: number): string {
  if (!Number.isFinite(position)) {
    return 'Pos 0.0';
  }
  
  // Format with exactly one decimal place
  return `Pos ${position.toFixed(1)}`;
}

/**
 * Format ISO date strings for display
 * @param isoString - ISO 8601 date string
 * @param fallback - Fallback string if date is invalid (default: '—')
 * @returns Formatted date string or fallback
 * 
 * Examples:
 * - formatDate('2024-01-15T10:30:00Z') => "15 Jan 2024"
 * - formatDate(null) => "—"
 * - formatDate('invalid') => "—"
 */
export function formatDate(isoString: string | null | undefined, fallback = '—'): string {
  if (!isoString) {
    return fallback;
  }
  
  try {
    const date = new Date(isoString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return fallback;
    }
    
    // Format as "DD MMM YYYY"
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  } catch {
    return fallback;
  }
}

/**
 * Defensive null safety helper - safely access nested properties
 * @param obj - Object to check
 * @param path - Dot-separated path to property
 * @param defaultValue - Default value if property doesn't exist
 * @returns Property value or default
 * 
 * Example:
 * - safeGet({ a: { b: 5 } }, 'a.b', 0) => 5
 * - safeGet({ a: null }, 'a.b', 0) => 0
 */
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  try {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result == null) {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely get array or return empty array
 * @param value - Value that might be an array
 * @returns Array or empty array
 */
export function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Safely get string or return empty string
 * @param value - Value that might be a string
 * @returns String or empty string
 */
export function safeString(value: string | null | undefined): string {
  return typeof value === 'string' ? value : '';
}

/**
 * Safely get number or return zero
 * @param value - Value that might be a number
 * @returns Number or zero
 */
export function safeNumber(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}
