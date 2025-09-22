import createClient, { Middleware } from 'openapi-fetch';

import type { paths } from '@/generated/openapi';
import { BASE_URL } from '@/lib/api/constants';
import { serializeAuthCookie } from '@/lib/auth/auth-server';
import { logger } from '@/lib/logger';

import 'server-only';

import { ApiError, isApiError } from './api-error';

export async function createServerClient() {
  const cookieHeader = await serializeAuthCookie();
  const client = createBaseServerClient(cookieHeader);
  client.use(throwErrorMiddleware);
  return client;
}

const throwErrorMiddleware: Middleware = {
  async onResponse({ response }) {
    if (!response.ok) {
      const error = await response.clone().json();
      if (isApiError(error)) {
        throw new ApiError(error);
      } else {
        throw new Error(error);
      }
    }
  },
};

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
