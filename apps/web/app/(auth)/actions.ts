'use server';

import z from 'zod/v4';

import { api } from '@/lib/api';

const authFormSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export async function login(
  prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const res = await api.POST('/auth/login');
    console.log(res);

    return { status: 'success' };
  } catch (error) {
    console.log({ error });
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
}
