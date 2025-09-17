import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';

import { DRIZZLE_PROVIDER } from '@/drizzle/drizzle.provider';
import { profilesTable } from '@/drizzle/schema';
import { ProfileDto } from '@/profiles/dto/profile.dto';
import { UserDto } from '@/users/dto/user.dto';

import { AppModule } from '../src/app.module';
import { loginUser } from './utils/auth.utils';
import {
  cleanupDb,
  createAdmin,
  createUser,
  DbUtils,
  setupTestDb,
  truncateAllTables,
} from './utils/db.utils';

describe('ProfilesController (e2e)', () => {
  let app: INestApplication<App>;
  let dbUtils: DbUtils;
  let adminCookies: string[];
  let userCookies: string[];
  let user: UserDto;

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

    user = await createUser(dbUtils);
    await createAdmin(dbUtils);

    adminCookies = await loginUser(app, { email: 'admin@test.com' });
    userCookies = await loginUser(app, { email: 'user@test.com' });
  });

  afterAll(async () => {
    await cleanupDb(dbUtils);
    await app.close();
  });

  describe('/profile (GET)', () => {
    it("should return the current user's profile", async () => {
      await dbUtils.db.insert(profilesTable).values({
        userId: user.id,
        displayName: 'Test User',
      });

      const response = await request(app.getHttpServer())
        .get('/profile')
        .set('Cookie', userCookies)
        .expect(200);

      const body = response.body as ProfileDto;
      expect(body.displayName).toBe('Test User');
      expect(body.userId).toBe(user.id);
    });

    it('should return 404 if the user does not have a profile', async () => {
      await request(app.getHttpServer()).get('/profile').set('Cookie', userCookies).expect(404);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer()).get('/profile').expect(401);
    });
  });

  describe('/profiles (PATCH)', () => {
    it("should update the current user's profile", async () => {
      await dbUtils.db.insert(profilesTable).values({
        userId: user.id,
        displayName: 'Old Name',
      });

      const updateProfileDto = { displayName: 'New Name' };

      const response = await request(app.getHttpServer())
        .patch('/profile')
        .set('Cookie', userCookies)
        .send(updateProfileDto)
        .expect(200);

      const body = response.body as ProfileDto;
      expect(body.displayName).toBe('New Name');
    });

    it('should return 404 if the user does not have a profile', async () => {
      const updateProfileDto = { displayName: 'New Name' };
      await request(app.getHttpServer())
        .patch('/profiles')
        .set('Cookie', userCookies)
        .send(updateProfileDto)
        .expect(404);
    });
  });

  describe('/admin/profiles/:userId (POST)', () => {
    it('should allow an admin to create a profile for a user', async () => {
      const createProfileDto = { displayName: 'Test User Profile' };

      const response = await request(app.getHttpServer())
        .post(`/admin/profiles/${user.id}`)
        .set('Cookie', adminCookies)
        .send(createProfileDto)
        .expect(201);

      const body = response.body as ProfileDto;
      expect(body.displayName).toBe(createProfileDto.displayName);
      expect(body.userId).toBe(user.id);
    });

    it('should return 403 if a non-admin tries to create a profile', async () => {
      const createProfileDto = { displayName: 'Test User Profile' };

      await request(app.getHttpServer())
        .post(`/admin/profiles/${user.id}`)
        .set('Cookie', userCookies)
        .send(createProfileDto)
        .expect(403);
    });

    it('should return 409 if a profile already exists for the user', async () => {
      await dbUtils.db.insert(profilesTable).values({
        userId: user.id,
        displayName: 'Existing Profile',
      });

      const createProfileDto = { displayName: 'New Profile' };

      await request(app.getHttpServer())
        .post(`/admin/profiles/${user.id}`)
        .set('Cookie', adminCookies)
        .send(createProfileDto)
        .expect(409);
    });
  });
});
