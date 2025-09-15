'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import z from 'zod';

import { api } from '@/lib/api';
import { isApiError } from '@/lib/api-utils';
import { getAuthCookie } from '@/lib/auth-cookie';

const authFormSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export interface LoginActionState {
  error?: string;
}
export async function login(_: LoginActionState, formData: FormData): Promise<LoginActionState> {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const { error: apiError, response } = await api.POST('/auth/login', {
      body: validatedData,
    });

    if (apiError) {
      throw apiError;
    }

    const cookie = getAuthCookie(response);
    const cookieStore = await cookies();

    if (cookie?.accessToken) {
      cookieStore.set(cookie.accessToken);
    }
    if (cookie?.refreshToken) {
      cookieStore.set(cookie.refreshToken);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid data' };
    }

    if (isApiError(error)) {
      return { error: error.message };
    }

    return { error: 'Authentication failed' };
  }

  redirect('/');
}
