// src/components/ErrorState.tsx
// Error state component for Analytics Frontend Completion
// Displays user-friendly error messages with retry functionality

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

interface ErrorStateProps {
  error: FetchBaseQueryError | SerializedError;
  onRetry: () => void;
  context: string; // "Revenue Leak", "Product Health", etc.
  className?: string;
}

/**
 * Get user-friendly error message from RTK Query error
 * Maps error types to actionable messages
 */
export function getErrorMessage(error: FetchBaseQueryError | SerializedError): string {
  // Handle FetchBaseQueryError (network errors, HTTP errors)
  if ('status' in error) {
    if (error.status === 'FETCH_ERROR') {
      return 'Unable to connect. Please check your internet connection.';
    }
    if (error.status === 404) {
      return 'Store not found. Please select a different store.';
    }
    if (error.status === 500) {
      return 'Server error. Please try again in a few moments.';
    }
    if (error.status === 401 || error.status === 403) {
      return 'Authentication error. Please log in again.';
    }
    if (typeof error.status === 'number') {
      // Try to extract message from error data
      const data = error.data as any;
      if (data?.message) {
        return `Error ${error.status}: ${data.message}`;
      }
      return `Error ${error.status}: An unexpected error occurred.`;
    }
    return 'Network error. Please try again.';
  }
  
  // Handle SerializedError (JavaScript errors)
  if ('message' in error && error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * ErrorState component
 * Displays error message with retry button
 * Includes proper accessibility attributes
 */
export function ErrorState({ error, onRetry, context, className }: ErrorStateProps) {
  const message = getErrorMessage(error);
  
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'rounded-2xl border bg-card p-6 text-center',
        className
      )}
    >
      <AlertCircle 
        className="h-8 w-8 mx-auto mb-3 text-destructive" 
        aria-hidden="true" 
      />
      <h3 className="text-sm font-semibold mb-1 text-card-foreground">
        Failed to Load {context}
      </h3>
      <p className="text-sm mb-4 text-muted-foreground">
        {message}
      </p>
      <Button
        onClick={onRetry}
        variant="outline"
        size="sm"
        aria-label={`Retry loading ${context}`}
      >
        Retry
      </Button>
    </div>
  );
}
