'use server';

import { unstable_cache } from 'next/cache';
import { redirect } from 'next/navigation';

import { createDynamicServerApi, createServerApi } from '@/lib/api';
import { ApiError } from '@/lib/api/api-utils';
import { clearAuthCookies, serializeAuthCookies } from '@/lib/auth/auth-cookie';

export async function logout() {
  await logoutUser();
  await clearAuthCookies();
  redirect('/login');
}

async function logoutUser() {
  const serverApi = await createServerApi();

  try {
    const { error } = await serverApi.POST('/auth/logout');
    if (error) {
      throw new ApiError(error);
    }
  } catch (error) {
    console.error('API logout failed:', error);
  }
}

const getCachedProfile = unstable_cache(
  async (authCookies: string | null) => {
    if (!authCookies) return null;

    const serverApi = await createDynamicServerApi(authCookies);
    const { data, error } = await serverApi.GET('/profiles/me');

    if (error) {
      throw new Error("Couldn't get profile");
    }

    return data;
  },
  ['profile'],
  {
    revalidate: 300,
  }
);

export async function getProfile() {
  try {
    const authCookies = await serializeAuthCookies();
    const profile = await getCachedProfile(authCookies);
    return profile;
  } catch {
    console.error('API getProfile failed:');
    await logoutUser();
    redirect('/login');
  }
}
