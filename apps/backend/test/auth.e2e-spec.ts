import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import { App } from 'supertest/types';

import { RegisterUserDto } from '@/auth/dto/register.dto';
import { DRIZZLE_PROVIDER } from '@/drizzle/drizzle.provider';
import { profilesTable } from '@/drizzle/schema';
import { ValidateUser } from '@/types';
import { UserDto } from '@/users/dto/user.dto';

import { AppModule } from '../src/app.module';
import { loginUser, mockPassword } from './utils/auth.utils';
import {
  cleanupDb,
  createAdmin,
  createUser,
  DbUtils,
  findUserByEmail,
  setupTestDb,
  truncateAllTables,
} from './utils/db.utils';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let dbUtils: DbUtils;
  let adminCookies: string[];
  let admin: UserDto;

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
    admin = await createAdmin(dbUtils);

    adminCookies = await loginUser(app, { email: admin.email });
  });

  afterAll(async () => {
    await cleanupDb(dbUtils);
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    const newUserData: RegisterUserDto = {
      email: 'newuser@test.com',
      password: 'NewPassword123!',
    };

    it('should register a new user when called by an admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .set('Cookie', adminCookies)
        .send(newUserData)
        .expect(201);

      const createdUser = response.body as UserDto;
      expect(createdUser).toBeDefined();
      expect(createdUser.email).toBe(newUserData.email);

      const dbUser = (await findUserByEmail(dbUtils, newUserData.email)) as UserDto;
      expect(dbUser).toBeDefined();
      expect(dbUser.email).toBe(newUserData.email);

      const [profile] = await dbUtils.db
        .select()
        .from(profilesTable)
        .where(eq(profilesTable.userId, createdUser.id));

      if (!profile) {
        fail('Profile not found');
      }

      expect(profile).toBeDefined();
      expect(profile.displayName).toBe(newUserData.email.split('@')[0]);
    });

    it('should return 403 when a non-admin tries to register a user', async () => {
      const user = await createUser(dbUtils);
      const userCookies = await loginUser(app, {
        email: user.email,
      });

      await request(app.getHttpServer())
        .post('/auth/register')
        .set('Cookie', userCookies)
        .send(newUserData)
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer()).post('/auth/register').send(newUserData).expect(401);
    });

    it('should return 400 for invalid password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .set('Cookie', adminCookies)
        .send({ email: 'test@test.com', password: 'weak' })
        .expect(400);

      const { errors } = response.body as {
        errors: {
          message: string;
        }[];
      };

      expect(
        errors.some(error => error.message === 'Password must be at least 8 characters long')
      ).toBe(true);
    });

    it('should return 400 for invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .set('Cookie', adminCookies)
        .send({ email: 'not-an-email', password: 'Password123!' })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login a user with correct credentials and set cookies', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: admin.email, password: mockPassword })
        .expect(201);

      const body = response.body as ValidateUser;

      expect(body.userId).toBe(admin.id);
      expect(body.role).toBe(admin.role);
      const cookies = response.get('Set-Cookie');
      expect(cookies).toBeDefined();

      if (!cookies) {
        fail('No cookies returned');
      }

      expect(cookies.some((c: string) => c.startsWith('Authentication='))).toBe(true);
      expect(cookies.some((c: string) => c.startsWith('Refresh='))).toBe(true);
    });

    it('should return 401 for incorrect password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: admin.email, password: 'wrongpassword' })
        .expect(401);
    });

    it('should return 401 for non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nouser@test.com', password: 'password' })
        .expect(401);
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should logout a user and clear cookies', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', adminCookies)
        .expect(204);

      const cookies = response.get('Set-Cookie');
      expect(cookies).toBeDefined();

      if (!cookies) {
        fail('No cookies returned');
      }

      expect(cookies.some((c: string) => c.startsWith('Authentication=;'))).toBe(true);
      expect(cookies.some((c: string) => c.startsWith('Refresh=;'))).toBe(true);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should refresh tokens successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', adminCookies)
        .expect(201);

      const body = response.body as ValidateUser;

      expect(body.userId).toBe(admin.id);
      const newCookies = response.get('Set-Cookie');
      expect(newCookies).toBeDefined();

      if (!newCookies) {
        fail('No new cookies returned');
      }
      expect(newCookies.some((c: string) => c.startsWith('Authentication='))).toBe(true);
      expect(newCookies.some((c: string) => c.startsWith('Refresh='))).toBe(true);
    });

    it('should return 401 if refresh token is missing', async () => {
      const authCookiesWithoutRefresh = adminCookies.filter(
        cookie => !cookie.startsWith('Refresh=')
      );
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', authCookiesWithoutRefresh)
        .expect(401);
    });

    it('should return 401 if refresh token is invalid', async () => {
      const authCookie = adminCookies.find(c => c.startsWith('Authentication='));
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [authCookie || '', 'Refresh=invalid-token; Path=/; HttpOnly'])
        .expect(401);
    });
  });
});
