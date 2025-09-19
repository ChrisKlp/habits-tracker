import { createServerClient } from '@/lib/api/api-server';

export async function getProfile() {
  const client = await createServerClient();

  const { data, error } = await client.GET('/profiles/me');

  if (error) {
    return null;
  }

  return data;
}
