import { BailoutToCSRError } from 'next/dist/shared/lib/lazy-dynamic/bailout-to-csr';
import { redirect } from 'next/navigation';

import createClient, { Middleware } from 'openapi-fetch';

import type { paths } from '@/generated/openapi';
import { logger } from '@/lib/logger';
import { ApiError, isApiError } from './api-error';
import { BASE_URL } from './constants';

const noRefreshRoutes = ['/auth/refresh', '/auth/logout'];

function isNoRefreshRoute(url: string): boolean {
  return noRefreshRoutes.some(route => url.includes(route));
}

async function customFetch(input: RequestInfo | URL, init?: RequestInit) {
  const requestUrl = input instanceof Request ? input.url : input.toString();

  const response = await fetch(input, init);

  if (response.status === 401 && !isNoRefreshRoute(requestUrl)) {
    logger.log('customFetch - attempting to refresh auth');

    const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!refreshResponse.ok) {
      redirect('/login');
    }

    return await fetch(input, init);
  }

  return response;
}

export const apiClient = createClient<paths>({
  baseUrl: BASE_URL,
  credentials: 'include',
  fetch: customFetch,
});

const clientOnlyMiddleware: Middleware = {
  async onRequest() {
    if (typeof window === 'undefined') {
      // To prevent this artificial error from appearing in the browser console, we use a special Next.js error type: `BailoutToCSRError`.
      // This error type is filtered out by Next.js during hydration (see `onRecoverableError` in React docs and Next.js implementation).
      throw new BailoutToCSRError(
        'Skipped client-only request on server. This error can be ignored.'
      );
    }
  },
};

const throwErrorMiddleware: Middleware = {
  async onResponse({ response }) {
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        const errorData = await response.clone().json();
        
        if (isApiError(errorData)) {
          throw new ApiError(errorData);
        }
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  },
};

apiClient.use(clientOnlyMiddleware);
apiClient.use(throwErrorMiddleware);
