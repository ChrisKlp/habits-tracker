import { redirect } from 'next/navigation';

import createClient from 'openapi-fetch';

import type { paths } from '@/generated/openapi';
import { logger } from '@/lib/logger';
import { BASE_URL } from './constants';

async function customFetch(input: RequestInfo | URL, init?: RequestInit) {
  const requestUrl = input instanceof Request ? input.url : input.toString();

  logger.clientFetch(requestUrl, init?.method);

  try {
    const response = await fetch(input, init);

    if (response.status === 401 && !requestUrl.includes('/auth/refresh')) {
      logger.log('customFetch - attempting to refresh auth');

      const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!refreshResponse.ok) {
        redirect('/login');
      }

      return fetch(input, init);
    }
    return response;
  } catch {
    return new Response('Could not connect to server', { status: 500 });
  }
}

export const apiClient = createClient<paths>({
  baseUrl: BASE_URL,
  credentials: 'include',
  fetch: customFetch,
});
