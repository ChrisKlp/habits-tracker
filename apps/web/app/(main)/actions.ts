'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { createServerApi } from '@/lib/api';
import { AUTH_COOKIE, REFRESH_COOKIE } from '@/lib/auth/auth-cookie';

export async function logout() {
  const serverApi = await createServerApi();

  try {
    await serverApi.POST('/auth/logout');
  } catch (error) {
    console.error('API logout failed:', error);
  }

  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);

  redirect('/login');
}
