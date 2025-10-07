'use client';

import { AlertTriangle, RefreshCw, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryLabel?: string;
  className?: string;
  variant?: 'default' | 'critical';
}

export function ErrorAlert({
  title = 'Something went wrong',
  message,
  onRetry,
  onDismiss,
  retryLabel = 'Try again',
  className,
  variant = 'default',
}: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className={`relative rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm ${className}`}
    >
      {/* Header with icon and dismiss button */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div
            className={`flex-shrink-0 ${variant === 'critical' ? 'text-red-600' : 'text-red-500'}`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className={`text-sm font-semibold ${variant === 'critical' ? 'text-red-800' : 'text-red-700'}`}
            >
              {title}
            </h3>
            <div className="mt-2 text-sm leading-relaxed text-red-600">{message}</div>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-red-400 transition-colors hover:text-red-600"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Action buttons */}
      {onRetry && (
        <div className="mt-4 flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onRetry?.();
            }}
            className="border-red-300 bg-white text-red-700 hover:border-red-400 hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
