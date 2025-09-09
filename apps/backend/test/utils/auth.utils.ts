import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

export const userIds = {
  admin: '36782f66-2655-4ec9-a239-1a6ff022fef8',
  user: '36782f66-2655-4ec9-a239-1a6ff022fef9',
  user2: '36782f66-2655-4ec9-a239-1a6ff022fefa',
};

export const mockPassword = 'passwordA123!';

type LoginCredentials = {
  email: string;
  password?: string;
};

export async function loginUser(
  app: INestApplication<App>,
  { email, password = mockPassword }: LoginCredentials,
): Promise<string[]> {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password });

  if (response.status !== 201) {
    throw new Error(`Failed to login as ${email}. Status: ${response.status}`);
  }

  const cookies = response.headers['set-cookie'] as unknown as string[];
  if (!cookies) {
    throw new Error(`No cookies returned for ${email}`);
  }

  return cookies;
}
