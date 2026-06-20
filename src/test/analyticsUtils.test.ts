// src/test/analyticsUtils.test.ts
// Unit tests for analytics utility functions

import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatPosition,
  formatDate,
  safeGet,
  safeArray,
  safeString,
  safeNumber,
} from '@/lib/analyticsUtils';

describe('formatCurrency', () => {
  it('formats positive numbers with Indian locale', () => {
    expect(formatCurrency(1234567)).toBe('₹12,34,567');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('₹0');
  });

  it('rounds to nearest integer', () => {
    expect(formatCurrency(1234.56)).toBe('₹1,235');
    expect(formatCurrency(1234.49)).toBe('₹1,234');
  });

  it('handles large numbers', () => {
    expect(formatCurrency(10000000)).toBe('₹1,00,00,000');
  });

  it('handles negative numbers', () => {
    expect(formatCurrency(-1234)).toBe('-₹1,234');
  });

  it('handles non-finite numbers', () => {
    expect(formatCurrency(NaN)).toBe('₹0');
    expect(formatCurrency(Infinity)).toBe('₹0');
    expect(formatCurrency(-Infinity)).toBe('₹0');
  });
});

describe('formatPosition', () => {
  it('formats with one decimal place', () => {
    expect(formatPosition(12.456)).toBe('Pos 12.5');
    expect(formatPosition(8)).toBe('Pos 8.0');
    expect(formatPosition(3.14)).toBe('Pos 3.1');
  });

  it('rounds correctly', () => {
    expect(formatPosition(12.44)).toBe('Pos 12.4');
    // Note: 12.45 rounds to 12.4 due to IEEE 754 floating point representation
    expect(formatPosition(12.45)).toBe('Pos 12.4');
    expect(formatPosition(12.46)).toBe('Pos 12.5');
  });

  it('handles non-finite numbers', () => {
    expect(formatPosition(NaN)).toBe('Pos 0.0');
    expect(formatPosition(Infinity)).toBe('Pos 0.0');
  });
});

describe('formatDate', () => {
  it('formats valid ISO strings', () => {
    expect(formatDate('2024-01-15T10:30:00Z')).toBe('15 Jan 2024');
    expect(formatDate('2023-12-25T00:00:00Z')).toBe('25 Dec 2023');
  });

  it('handles null and undefined', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
  });

  it('handles invalid date strings', () => {
    expect(formatDate('invalid')).toBe('—');
    expect(formatDate('not-a-date')).toBe('—');
  });

  it('uses custom fallback', () => {
    expect(formatDate(null, 'N/A')).toBe('N/A');
    expect(formatDate('invalid', 'Unknown')).toBe('Unknown');
  });
});

describe('safeGet', () => {
  it('retrieves nested properties', () => {
    const obj = { a: { b: { c: 5 } } };
    expect(safeGet(obj, 'a.b.c', 0)).toBe(5);
  });

  it('returns default for missing properties', () => {
    const obj = { a: { b: 5 } };
    expect(safeGet(obj, 'a.b.c', 0)).toBe(0);
    expect(safeGet(obj, 'x.y.z', 'default')).toBe('default');
  });

  it('handles null and undefined in path', () => {
    const obj = { a: null };
    expect(safeGet(obj, 'a.b', 0)).toBe(0);
  });

  it('handles null object', () => {
    expect(safeGet(null, 'a.b', 0)).toBe(0);
    expect(safeGet(undefined, 'a.b', 0)).toBe(0);
  });
});

describe('safeArray', () => {
  it('returns array as-is', () => {
    const arr = [1, 2, 3];
    expect(safeArray(arr)).toBe(arr);
  });

  it('returns empty array for null/undefined', () => {
    expect(safeArray(null)).toEqual([]);
    expect(safeArray(undefined)).toEqual([]);
  });

  it('returns empty array for non-arrays', () => {
    expect(safeArray('not an array' as any)).toEqual([]);
    expect(safeArray(123 as any)).toEqual([]);
    expect(safeArray({} as any)).toEqual([]);
  });
});

describe('safeString', () => {
  it('returns string as-is', () => {
    expect(safeString('hello')).toBe('hello');
  });

  it('returns empty string for null/undefined', () => {
    expect(safeString(null)).toBe('');
    expect(safeString(undefined)).toBe('');
  });

  it('returns empty string for non-strings', () => {
    expect(safeString(123 as any)).toBe('');
    expect(safeString({} as any)).toBe('');
  });
});

describe('safeNumber', () => {
  it('returns number as-is', () => {
    expect(safeNumber(123)).toBe(123);
    expect(safeNumber(0)).toBe(0);
    expect(safeNumber(-456)).toBe(-456);
  });

  it('returns zero for null/undefined', () => {
    expect(safeNumber(null)).toBe(0);
    expect(safeNumber(undefined)).toBe(0);
  });

  it('returns zero for non-finite numbers', () => {
    expect(safeNumber(NaN)).toBe(0);
    expect(safeNumber(Infinity)).toBe(0);
    expect(safeNumber(-Infinity)).toBe(0);
  });

  it('returns zero for non-numbers', () => {
    expect(safeNumber('123' as any)).toBe(0);
    expect(safeNumber({} as any)).toBe(0);
  });
});
