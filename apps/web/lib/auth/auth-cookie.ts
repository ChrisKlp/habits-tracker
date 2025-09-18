import { cookies } from 'next/headers';

import { jwtDecode } from 'jwt-decode';

export const AUTH_COOKIE = 'Authentication';
export const REFRESH_COOKIE = 'Refresh';

export function getAuthCookie(res: Response) {
  const setCookieHeader = res.headers.get('Set-Cookie');
  if (!setCookieHeader) {
    return;
  }

  const accessToken = setCookieHeader
    .split(';')
    .find(cookieHeader => cookieHeader.includes(AUTH_COOKIE))
    ?.split('=')[1];

  const refreshToken = setCookieHeader
    .split(';')
    .find(cookieHeader => cookieHeader.includes(REFRESH_COOKIE))
    ?.split('=')[1];

  return {
    accessToken: accessToken && {
      name: AUTH_COOKIE,
      value: accessToken,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      expires: new Date(jwtDecode(accessToken).exp! * 1000),
    },
    refreshToken: refreshToken && {
      name: REFRESH_COOKIE,
      value: refreshToken,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      expires: new Date(jwtDecode(refreshToken).exp! * 1000),
    },
  };
}

export async function serializeAuthCookies() {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(AUTH_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  const cookieHeaderParts: string[] = [];

  if (accessToken) {
    cookieHeaderParts.push(`${AUTH_COOKIE}=${accessToken}`);
  }
  if (refreshToken) {
    cookieHeaderParts.push(`${REFRESH_COOKIE}=${refreshToken}`);
  }

  return cookieHeaderParts.length > 0 ? cookieHeaderParts.join('; ') : null;
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}
