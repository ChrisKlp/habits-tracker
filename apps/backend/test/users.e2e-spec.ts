import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UsersService } from '../src/users/users.service';
import { App } from 'supertest/types';
import { mockUser, mockUsersService } from './mocks/mock-users-service';
import { createTestingModule } from './utils/createTestingModule';

async function createUsersTestingModule(
  authenticated = true,
  authorized = true,
) {
  return createTestingModule(
    UsersService,
    mockUsersService,
    authenticated,
    authorized,
  );
}

describe('UsersController (integration, mock Drizzle)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture = await createUsersTestingModule();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users (GET) should return all users', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .expect(200);
    expect(response.body).toEqual([mockUser]);
  });

  it('/users/:id (GET) should return one user', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/1')
      .expect(200);
    expect(response.body).toEqual(mockUser);
  });

  it('/users/:id (GET) should return 401 if not authenticated', async () => {
    const moduleFixture = await createUsersTestingModule(false);

    const currentApp: INestApplication<App> =
      moduleFixture.createNestApplication();
    await currentApp.init();

    const response = await request(currentApp.getHttpServer())
      .get('/users/1')
      .expect(401);
    expect(response.body).toMatchObject({
      error: 'Unauthorized',
      statusCode: 401,
    });

    await currentApp.close();
  });

  it('/users/:id (GET) should return 403 if not authorized', async () => {
    const moduleFixture = await createUsersTestingModule(true, false);

    const currentApp: INestApplication<App> =
      moduleFixture.createNestApplication();
    await currentApp.init();

    const response = await request(currentApp.getHttpServer())
      .get('/users/1')
      .expect(403);
    expect(response.body).toMatchObject({
      error: 'Forbidden',
      statusCode: 403,
    });

    await currentApp.close();
  });
});
