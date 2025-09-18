import { cookies } from 'next/headers';

import createClient from 'openapi-fetch';

import 'server-only';

import type { paths } from '@/generated/openapi';
import { BASE_URL } from '@/lib/api/constants';
import { AUTH_COOKIE, REFRESH_COOKIE } from '@/lib/auth/constants';

export async function createServerClient() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE);
  const refreshCookie = cookieStore.get(REFRESH_COOKIE);

  const cookieHeader = [
    authCookie ? `${authCookie.name}=${authCookie.value}` : '',
    refreshCookie ? `${refreshCookie.name}=${refreshCookie.value}` : '',
  ]
    .filter(Boolean)
    .join('; ');

  return createClient<paths>({
    baseUrl: BASE_URL,
    headers: {
      Cookie: cookieHeader,
    },
  });
}
