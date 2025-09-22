import { cookies } from 'next/headers';

import { AUTH_COOKIE, REFRESH_COOKIE } from './constants';

import 'server-only';

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
