import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

export const mockAdmin = {
  id: '36782f66-2655-4ec9-a239-1a6ff022fef8',
  email: 'admin@test.com',
  role: 'admin',
};

export const mockUser = {
  id: '36782f66-2655-4ec9-a239-1a6ff022fef9',
  email: 'user@test.com',
  role: 'user',
};

export const mockUser2 = {
  id: '36782f66-2655-4ec9-a239-1a6ff022fefa',
  email: 'user2@test.com',
  role: 'user',
};

export const mockPassword = 'passwordA123!';

type LoginCredentials = {
  email: string;
  password?: string;
};

export async function loginUser(
  app: INestApplication<App>,
  { email, password = mockPassword }: LoginCredentials
): Promise<string[]> {
  const response = await request(app.getHttpServer()).post('/auth/login').send({ email, password });

  if (response.status !== 201) {
    throw new Error(`Failed to login as ${email}. Status: ${response.status}`);
  }

  const cookies = response.headers['set-cookie'] as unknown as string[];
  if (!cookies) {
    throw new Error(`No cookies returned for ${email}`);
  }

  return cookies;
}
