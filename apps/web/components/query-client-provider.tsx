'use client';

import { PropsWithChildren } from 'react';

import { QueryClientProvider as OriginalQueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { getQueryClient } from '@/lib/api/get-query-client';

export function QueryClientProvider({ children }: PropsWithChildren) {
  const queryClient = getQueryClient();

  return (
    <OriginalQueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </OriginalQueryClientProvider>
  );
}
