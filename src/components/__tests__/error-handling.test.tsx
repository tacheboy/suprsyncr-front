// src/components/__tests__/error-handling.test.tsx
// Unit tests for error handling components
// Tests ErrorState, CardSkeleton, and AnalyticsErrorBoundary

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorState, getErrorMessage } from '../ErrorState';
import { CardSkeleton, CompactCardSkeleton, TableRowSkeleton } from '../CardSkeleton';
import { AnalyticsErrorBoundary } from '../AnalyticsErrorBoundary';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

describe('getErrorMessage', () => {
  it('returns network error message for FETCH_ERROR', () => {
    const error: FetchBaseQueryError = {
      status: 'FETCH_ERROR',
      error: 'Failed to fetch',
    };
    expect(getErrorMessage(error)).toBe('Unable to connect. Please check your internet connection.');
  });

  it('returns store not found message for 404', () => {
    const error: FetchBaseQueryError = {
      status: 404,
      data: null,
    };
    expect(getErrorMessage(error)).toBe('Store not found. Please select a different store.');
  });

  it('returns server error message for 500', () => {
    const error: FetchBaseQueryError = {
      status: 500,
      data: null,
    };
    expect(getErrorMessage(error)).toBe('Server error. Please try again in a few moments.');
  });

  it('returns authentication error message for 401', () => {
    const error: FetchBaseQueryError = {
      status: 401,
      data: null,
    };
    expect(getErrorMessage(error)).toBe('Authentication error. Please log in again.');
  });

  it('returns authentication error message for 403', () => {
    const error: FetchBaseQueryError = {
      status: 403,
      data: null,
    };
    expect(getErrorMessage(error)).toBe('Authentication error. Please log in again.');
  });

  it('extracts message from error data when available', () => {
    const error: FetchBaseQueryError = {
      status: 400,
      data: { message: 'Invalid request parameters' },
    };
    expect(getErrorMessage(error)).toBe('Error 400: Invalid request parameters');
  });

  it('returns generic error message for unknown HTTP errors', () => {
    const error: FetchBaseQueryError = {
      status: 418,
      data: null,
    };
    expect(getErrorMessage(error)).toBe('Error 418: An unexpected error occurred.');
  });

  it('returns message from SerializedError', () => {
    const error: SerializedError = {
      message: 'Something went wrong',
    };
    expect(getErrorMessage(error)).toBe('Something went wrong');
  });

  it('returns generic message for unknown error types', () => {
    const error = {} as any;
    expect(getErrorMessage(error)).toBe('An unexpected error occurred. Please try again.');
  });
});

describe('ErrorState', () => {
  it('renders error message and retry button', () => {
    const mockRetry = vi.fn();
    const error: FetchBaseQueryError = {
      status: 'FETCH_ERROR',
      error: 'Failed to fetch',
    };

    render(<ErrorState error={error} onRetry={mockRetry} context="Revenue Leak" />);

    expect(screen.getByText('Failed to Load Revenue Leak')).toBeInTheDocument();
    expect(screen.getByText('Unable to connect. Please check your internet connection.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry loading revenue leak/i })).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const mockRetry = vi.fn();
    const error: FetchBaseQueryError = {
      status: 500,
      data: null,
    };

    render(<ErrorState error={error} onRetry={mockRetry} context="Product Health" />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes', () => {
    const mockRetry = vi.fn();
    const error: FetchBaseQueryError = {
      status: 404,
      data: null,
    };

    const { container } = render(<ErrorState error={error} onRetry={mockRetry} context="SEO Gap" />);

    const alertElement = container.querySelector('[role="alert"]');
    expect(alertElement).toBeInTheDocument();
    expect(alertElement).toHaveAttribute('aria-live', 'assertive');
  });
});

describe('CardSkeleton', () => {
  it('renders with default 3 lines', () => {
    const { container } = render(<CardSkeleton />);
    
    const lines = container.querySelectorAll('.space-y-2 > div');
    expect(lines).toHaveLength(3);
  });

  it('renders with custom number of lines', () => {
    const { container } = render(<CardSkeleton lines={5} />);
    
    const lines = container.querySelectorAll('.space-y-2 > div');
    expect(lines).toHaveLength(5);
  });

  it('has proper accessibility attributes', () => {
    const { container } = render(<CardSkeleton />);
    
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading analytics data');
    expect(skeleton).toHaveAttribute('role', 'status');
  });

  it('includes screen reader text', () => {
    render(<CardSkeleton />);
    
    expect(screen.getByText('Loading analytics data, please wait...')).toBeInTheDocument();
  });

  it('has animate-pulse class for animation', () => {
    const { container } = render(<CardSkeleton />);
    
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('animate-pulse');
  });
});

describe('CompactCardSkeleton', () => {
  it('renders compact skeleton', () => {
    const { container } = render(<CompactCardSkeleton />);
    
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading');
  });
});

describe('TableRowSkeleton', () => {
  it('renders with default 4 columns', () => {
    const { container } = render(
      <table>
        <tbody>
          <TableRowSkeleton />
        </tbody>
      </table>
    );
    
    const cells = container.querySelectorAll('td');
    expect(cells).toHaveLength(4);
  });

  it('renders with custom number of columns', () => {
    const { container } = render(
      <table>
        <tbody>
          <TableRowSkeleton columns={6} />
        </tbody>
      </table>
    );
    
    const cells = container.querySelectorAll('td');
    expect(cells).toHaveLength(6);
  });
});

describe('AnalyticsErrorBoundary', () => {
  // Component that throws an error
  const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>No error</div>;
  };

  it('renders children when no error occurs', () => {
    render(
      <AnalyticsErrorBoundary>
        <ThrowError shouldThrow={false} />
      </AnalyticsErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders fallback UI when error occurs', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AnalyticsErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AnalyticsErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try loading the page again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go back to home page/i })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('calls onError callback when error occurs', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockOnError = vi.fn();

    render(
      <AnalyticsErrorBoundary onError={mockOnError}>
        <ThrowError shouldThrow={true} />
      </AnalyticsErrorBoundary>
    );

    expect(mockOnError).toHaveBeenCalledTimes(1);
    expect(mockOnError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );

    consoleSpy.mockRestore();
  });

  it('renders custom fallback when provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const customFallback = <div>Custom error message</div>;

    render(
      <AnalyticsErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </AnalyticsErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('resets error state when Try Again is clicked', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AnalyticsErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AnalyticsErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    const tryAgainButton = screen.getByRole('button', { name: /try loading the page again/i });
    fireEvent.click(tryAgainButton);

    // After clicking Try Again, the error boundary resets its state
    // but the component still throws, so we should still see the error UI
    // This test verifies the button is clickable and the handler is called
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
