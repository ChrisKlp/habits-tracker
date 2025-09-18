import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { apiClient } from './lib/api/api-client';
import { getAuthCookie } from './lib/auth/auth-cookie';
import { AUTH_COOKIE, REFRESH_COOKIE } from './lib/auth/constants';

const publicRoutes = ['/login'];

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();
  const authenticated = cookieStore.has(AUTH_COOKIE);

  if (!authenticated && cookieStore.has(REFRESH_COOKIE)) {
    const refresh = await apiClient.POST('/auth/refresh', {
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
    const authCookies = getAuthCookie(refresh.response);

    if (authCookies?.accessToken) {
      const response = NextResponse.redirect(request.url);
      response.cookies.set(authCookies.accessToken);
      return response;
    }
  }

  if (!authenticated && !publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    return Response.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico|sitemap.xml|robots.txt).*)'],
};
