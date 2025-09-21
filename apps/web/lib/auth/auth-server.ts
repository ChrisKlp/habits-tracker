// lib/auth.ts (server-only z openapi-fetch)
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ApiError } from '@/lib/api/api-error';
import { createServerClient } from '@/lib/api/api-server';
import { AUTH_COOKIE, REFRESH_COOKIE } from './constants';

import 'server-only';

export async function getServerUser() {
  try {
    const client = await createServerClient();
    const { data, error } = await client.GET('/auth/me');

    if (error) {
      throw new ApiError(error);
    }

    return data;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getServerUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get(AUTH_COOKIE);
    return !!authCookie;
  } catch {
    return false;
  }
}

export async function serializeAuthCookie() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE);
  const refreshCookie = cookieStore.get(REFRESH_COOKIE);

  return [
    authCookie ? `${authCookie.name}=${authCookie.value}` : '',
    refreshCookie ? `${refreshCookie.name}=${refreshCookie.value}` : '',
  ]
    .filter(Boolean)
    .join('; ');
}
