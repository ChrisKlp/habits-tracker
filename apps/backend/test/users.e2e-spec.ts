import { DRIZZLE_PROVIDER } from '@/drizzle/drizzle.provider';
import { UserDto } from '@/users/dto/user.dto';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { loginUser, mockUser } from './utils/auth.utils';
import {
  cleanupDb,
  createAdmin,
  createUser,
  createUser2,
  DbUtils,
  setupTestDb,
  truncateAllTables,
} from './utils/db.utils';

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
    await createAdmin(dbUtils);

    authCookies = await loginUser(app, { email: 'admin@test.com' });
  });

  afterAll(async () => {
    await cleanupDb(dbUtils);
    await app.close();
  });

  describe('/users (GET)', () => {
    it('should return all users for an admin', async () => {
      await createUser(dbUtils);

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
      await createUser(dbUtils);
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
      const newUser2 = await createUser2(dbUtils);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/users/${newUser2.id}`)
        .set('Cookie', authCookies)
        .expect(200);

      const body = response.body as UserDto;

      expect(body.id).toBe(newUser2.id);
      expect(body.email).toBe(newUser2.email);
      // @ts-expect-error verifying password is not returned
      expect(body.password).toBeUndefined();
    });

    it('should return 404 if user not found', async () => {
      await request(app.getHttpServer())
        .get(`/users/${mockUser.id}`)
        .set('Cookie', authCookies)
        .expect(404);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .get(`/users/${mockUser.id}`)
        .expect(401);
    });
  });
});
