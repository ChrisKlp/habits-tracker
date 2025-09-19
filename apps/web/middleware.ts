import { NextRequest, NextResponse } from 'next/server';

import { BASE_URL } from './lib/api/constants';
import { getAuthCookie } from './lib/auth/auth-cookie';
import { AUTH_COOKIE, REFRESH_COOKIE } from './lib/auth/constants';
import { logger } from './lib/logger';

export async function middleware(request: NextRequest) {
  const authCookie = request.cookies.get(AUTH_COOKIE);
  const refreshCookie = request.cookies.get(REFRESH_COOKIE);

  const isAuthPage = request.nextUrl.pathname.startsWith('/login');

  if (!isAuthPage) {
    if (!authCookie && refreshCookie) {
      logger.info(`[MIDDLEWARE] Attempting to refresh auth - ${request.url}`);

      const refresh = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          Cookie: `${refreshCookie.name}=${refreshCookie.value}`,
        },
      });
      const authCookies = getAuthCookie(refresh);

      if (authCookies?.accessToken) {
        const response = NextResponse.redirect(request.url);
        response.cookies.set(authCookies.accessToken);
        return response;
      }
    }

    if (!authCookie) {
      logger.info(`[MIDDLEWARE] Redirecting to login - ${request.url}`);
      return Response.redirect(new URL('/login', request.url));
    }
  }

  if (isAuthPage && authCookie) {
    return Response.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico|sitemap.xml|robots.txt).*)'],
};
