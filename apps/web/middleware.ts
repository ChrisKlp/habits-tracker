import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { api } from './lib/api/api';
import { AUTH_COOKIE, getAuthCookie, REFRESH_COOKIE } from './lib/auth/auth-cookie';

const publicRoutes = ['/login'];

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();
  const authenticated = cookieStore.has(AUTH_COOKIE);

  if (!authenticated && cookieStore.has(REFRESH_COOKIE)) {
    const refresh = await api.POST('/auth/refresh', {
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
