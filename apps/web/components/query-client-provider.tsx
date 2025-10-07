'use client';

import { PropsWithChildren, Suspense } from 'react';

import { QueryClientProvider as OriginalQueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from 'react-error-boundary';

import { getQueryClient } from '@/lib/api/get-query-client';
import { ErrorAlert } from './boundaries/error-alert';
import { LoadingIndicator } from './loading-indicator';

export function QueryClientProvider({ children }: PropsWithChildren) {
  const queryClient = getQueryClient();

  return (
    <OriginalQueryClientProvider client={queryClient}>
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <div className="fixed w-full p-6">
            <ErrorAlert
              message={error.message || 'Something went wrong while loading this page'}
              onRetry={resetErrorBoundary}
              variant="critical"
            />
          </div>
        )}
      >
        <Suspense fallback={<LoadingIndicator />}>{children}</Suspense>
      </ErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </OriginalQueryClientProvider>
  );
}
