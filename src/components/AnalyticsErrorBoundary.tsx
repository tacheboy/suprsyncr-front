// src/components/AnalyticsErrorBoundary.tsx
// React Error Boundary for Analytics Frontend Completion
// Catches component crashes and provides fallback UI

'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /**
   * Optional callback when error is caught
   * Can be used for error tracking (e.g., Sentry)
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * AnalyticsErrorBoundary
 * Catches JavaScript errors in child components
 * Displays fallback UI and provides recovery mechanism
 * 
 * Usage:
 * ```tsx
 * <AnalyticsErrorBoundary>
 *   <AnalyticsPage />
 * </AnalyticsErrorBoundary>
 * ```
 */
export class AnalyticsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('Analytics component error:', error, errorInfo);
    
    // Call optional error callback (for error tracking services)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Optional: Send to error tracking service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleReset = () => {
    // Reset error state to try rendering again
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div 
          className="min-h-screen flex items-center justify-center p-6"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-md w-full rounded-2xl border bg-card p-8 text-center shadow-sm">
            <AlertCircle 
              className="h-12 w-12 mx-auto mb-4 text-destructive" 
              aria-hidden="true"
            />
            <h2 className="text-lg font-semibold mb-2 text-card-foreground">
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {this.state.error?.message ?? 'An unexpected error occurred while loading the analytics dashboard.'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                variant="default"
                aria-label="Try loading the page again"
              >
                Try Again
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                aria-label="Go back to home page"
              >
                Go Home
              </Button>
            </div>
            
            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary wrapper for functional components
 * Note: This is a wrapper component, not a true hook
 * 
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   return (
 *     <ErrorBoundaryWrapper>
 *       <ComponentThatMightError />
 *     </ErrorBoundaryWrapper>
 *   );
 * }
 * ```
 */
export function ErrorBoundaryWrapper({ 
  children, 
  fallback 
}: { 
  children: ReactNode; 
  fallback?: ReactNode;
}) {
  return (
    <AnalyticsErrorBoundary fallback={fallback}>
      {children}
    </AnalyticsErrorBoundary>
  );
}
