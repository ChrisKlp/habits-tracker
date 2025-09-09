import { DRIZZLE_PROVIDER } from '@/drizzle/drizzle.provider';
import { UserDto } from '@/users/dto/user.dto';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { loginUser } from './utils/auth.utils';
import {
  cleanupDb,
  DbUtils,
  seedUser,
  setupTestDb,
  truncateAllTables,
} from './utils/db.utils';

const userIds = {
  admin: '36782f66-2655-4ec9-a239-1a6ff022fef8',
  user: '36782f66-2655-4ec9-a239-1a6ff022fef9',
  user2: '36782f66-2655-4ec9-a239-1a6ff022fefa',
};

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;
  let dbUtils: DbUtils;
  let authCookies: string[];

  beforeAll(async () => {
    dbUtils = await setupTestDb();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DRIZZLE_PROVIDER)
      .useValue(dbUtils.db)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  beforeEach(async () => {
    await truncateAllTables(dbUtils);
    await seedUser(dbUtils, {
      id: userIds.admin,
      email: 'admin@test.com',
      role: 'admin',
    });

    authCookies = await loginUser(app, { email: 'admin@test.com' });
  });

  afterAll(async () => {
    await cleanupDb(dbUtils);
    await app.close();
  });

  describe('/users (GET)', () => {
    it('should return all users for an admin', async () => {
      // Arrange
      await seedUser(dbUtils, {
        id: userIds.user,
        email: 'user@test.com',
        role: 'user',
      });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', authCookies)
        .expect(200);

      const body = response.body as UserDto[];

      expect(body).toBeInstanceOf(Array);
      expect(body.length).toBe(2);
      expect(body.find((u) => u.email === 'admin@test.com')).toBeDefined();
      expect(body.find((u) => u.email === 'user@test.com')).toBeDefined();
      // @ts-expect-error verifying password is not returned
      expect(body[0]?.password).toBeUndefined();
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer()).get('/users').expect(401);
    });

    it('should return 403 for a non-admin user', async () => {
      // Arrange
      await seedUser(dbUtils, {
        id: userIds.user,
        email: 'user@test.com',
        role: 'user',
      });
      const userCookies = await loginUser(app, { email: 'user@test.com' });

      // Act & Assert
      await request(app.getHttpServer())
        .get('/users')
        .set('Cookie', userCookies)
        .expect(403);
    });
  });

  describe('/users/:id (GET)', () => {
    it('should return a specific user by id', async () => {
      // Arrange
      const [newUser] = await seedUser(dbUtils, {
        id: userIds.user2,
        email: 'user2@test.com',
        role: 'user',
      });

      if (!newUser) {
        fail('Failed to create user');
      }

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/users/${newUser.id}`)
        .set('Cookie', authCookies)
        .expect(200);

      const body = response.body as UserDto;

      expect(body.id).toBe(newUser.id);
      expect(body.email).toBe(newUser.email);
      // @ts-expect-error verifying password is not returned
      expect(body.password).toBeUndefined();
    });

    it('should return 404 if user not found', async () => {
      await request(app.getHttpServer())
        .get(`/users/${userIds.user}`)
        .set('Cookie', authCookies)
        .expect(404);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .get(`/users/${userIds.user}`)
        .expect(401);
    });
  });
});
