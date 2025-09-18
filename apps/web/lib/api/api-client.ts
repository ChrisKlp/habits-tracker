'use client';

import createClient from 'openapi-fetch';

import type { paths } from '@/generated/openapi';
import { BASE_URL } from './constants';

async function customFetch(input: RequestInfo | URL, init?: RequestInit) {
  const requestUrl = input instanceof Request ? input.url : input.toString();
  const response = await fetch(input, init);

  if (response.status === 401 && !requestUrl.includes('/auth/refresh')) {
    const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshResponse.ok) {
      return fetch(input, init);
    }

    if (typeof window !== 'undefined') {
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  return response;
}

export const apiClient = createClient<paths>({
  baseUrl: BASE_URL,
  credentials: 'include',
  fetch: customFetch,
});
