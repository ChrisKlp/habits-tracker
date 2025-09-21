import createClient from 'openapi-fetch';

import type { paths } from '@/generated/openapi';
import { BASE_URL } from '@/lib/api/constants';
import { serializeAuthCookie } from '@/lib/auth/auth-server';
import { logger } from '@/lib/logger';

import 'server-only';

export async function createServerClient() {
  const cookieHeader = await serializeAuthCookie();
  return createBaseServerClient(cookieHeader);
}

export function createBaseServerClient(cookieHeader: string) {
  return createClient<paths>({
    baseUrl: BASE_URL,
    headers: {
      Cookie: cookieHeader,
    },
    fetch: input => {
      logger.serverFetch(input.url, input.method);
      return fetch(input);
    },
  });
}
