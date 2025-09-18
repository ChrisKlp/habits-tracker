import createClient from 'openapi-fetch';

import { paths } from '../../generated/openapi';
import { serializeAuthCookies } from '../auth/auth-cookie';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * API client for use in Client Components (the browser).
 * It uses `credentials: 'include'` to automatically send cookies.
 */
export const clientApi = createClient<paths>({
  baseUrl,
  credentials: 'include',
});

/**
 * API client for use in Server Actions and Route Handlers (the server).
 * It forwards headers from the incoming request and manually adds auth cookies.
 */
export async function createServerApi() {
  const authCookies = await serializeAuthCookies();
  const headers: HeadersInit = {};

  if (authCookies) {
    headers['Cookie'] = authCookies;
  }

  return createClient<paths>({
    baseUrl,
    headers,
  });
}

export async function createDynamicServerApi(authCookies: string) {
  return createClient<paths>({
    baseUrl,
    headers: {
      Cookie: authCookies,
    },
  });
}
