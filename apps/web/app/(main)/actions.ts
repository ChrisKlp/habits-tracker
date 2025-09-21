import { unstable_cache } from 'next/cache';

import { createBaseServerClient } from '@/lib/api/api-server';
import { serializeAuthCookie } from '@/lib/auth/auth-server';

export async function getProfile() {
  const cookieHeader = await serializeAuthCookie();
  return getCachedProfile(cookieHeader);
}

const getCachedProfile = unstable_cache(
  async (cookieHeader: string) => {
    const client = createBaseServerClient(cookieHeader);
    const { data } = await client.GET('/profiles/me');
    return data;
  },
  ['user-profile']
);
