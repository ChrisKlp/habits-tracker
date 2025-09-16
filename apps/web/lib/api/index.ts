import { cookies } from 'next/headers';

import createClient from 'openapi-fetch';

import { paths } from '../../generated/openapi';
import { AUTH_COOKIE, REFRESH_COOKIE } from '../auth/auth-cookie';

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
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(AUTH_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  const headers: HeadersInit = {};
  const cookieHeaderParts: string[] = [];

  if (accessToken) {
    cookieHeaderParts.push(`${AUTH_COOKIE}=${accessToken}`);
  }
  if (refreshToken) {
    cookieHeaderParts.push(`${REFRESH_COOKIE}=${refreshToken}`);
  }

  if (cookieHeaderParts.length > 0) {
    headers['Cookie'] = cookieHeaderParts.join('; ');
  }

  return createClient<paths>({
    baseUrl,
    headers,
  });
}
