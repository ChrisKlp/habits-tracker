import { DRIZZLE_PROVIDER } from '@/drizzle/drizzle.provider';
import { habitLogsTable } from '@/drizzle/schema';
import {
  CreateHabitLogDto,
  HabitLogDto,
  HabitLogWithHabitDto,
} from '@/habit-logs/dto/habit-log.dto';
import { HabitDto } from '@/habits/dto/habit.dto';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserDto } from '@/users/dto/user.dto';
import cookieParser from 'cookie-parser';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { loginUser } from './utils/auth.utils';
import {
  cleanupDb,
  createAdmin,
  createUser,
  DbUtils,
  insertHabit,
  insertHabitLog,
  setupTestDb,
  truncateAllTables,
} from './utils/db.utils';

describe('HabitLogsController (e2e)', () => {
  let app: INestApplication<App>;
  let dbUtils: DbUtils;
  let adminCookies: string[];
  let userCookies: string[];
  let admin: UserDto;
  let user: UserDto;
  let userHabit: HabitDto;
  let adminHabit: HabitDto;

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
    user = await createUser(dbUtils);

    adminCookies = await loginUser(app, { email: 'admin@test.com' });
    userCookies = await loginUser(app, { email: 'user@test.com' });

    userHabit = await insertHabit(dbUtils, {
      name: 'user habit',
      userId: user.id,
    });
    adminHabit = await insertHabit(dbUtils, {
      name: 'admin habit',
      userId: admin.id,
    });
  });

  afterAll(async () => {
    await cleanupDb(dbUtils);
    await app.close();
  });

  describe('/habit-logs (POST)', () => {
    it('should create a new habit log', async () => {
      const createHabitLogDto: CreateHabitLogDto = {
        habitId: userHabit.id,
        date: new Date().toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/habit-logs')
        .set('Cookie', userCookies)
        .send({
          ...createHabitLogDto,
          userId: user.id,
        })
        .expect(201);

      const body = response.body as HabitLogDto;
      expect(body.habitId).toBe(createHabitLogDto.habitId);
      expect(body.userId).toBe(user.id);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/habit-logs')
        .send({ habitId: userHabit.id })
        .expect(401);
    });
  });

  describe('/habit-logs (GET)', () => {
    it('should return only the habit logs for the current user', async () => {
      await insertHabitLog(dbUtils, {
        habitId: userHabit.id,
        userId: user.id,
      });
      await insertHabitLog(dbUtils, {
        habitId: adminHabit.id,
        userId: admin.id,
      });

      const response = await request(app.getHttpServer())
        .get('/habit-logs')
        .set('Cookie', userCookies)
        .expect(200);

      const body = response.body as HabitLogWithHabitDto[];
      expect(body.length).toBe(1);
      expect(body[0]?.userId).toBe(user.id);
    });

    it('should filter by date', async () => {
      const today = new Date().toISOString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayIso = yesterday.toISOString();

      await insertHabitLog(dbUtils, {
        habitId: userHabit.id,
        userId: user.id,
        date: today,
      });
      await insertHabitLog(dbUtils, {
        habitId: userHabit.id,
        userId: user.id,
        date: yesterdayIso,
      });

      const response = await request(app.getHttpServer())
        .get('/habit-logs')
        .query({ date: today })
        .set('Cookie', userCookies)
        .expect(200);

      const body = response.body as HabitLogWithHabitDto[];
      expect(body.length).toBe(1);
    });

    it('should filter by habitId', async () => {
      const anotherUserHabit = await insertHabit(dbUtils, {
        name: 'another user habit',
        userId: user.id,
      });
      await insertHabitLog(dbUtils, {
        habitId: userHabit.id,
        userId: user.id,
      });
      await insertHabitLog(dbUtils, {
        habitId: anotherUserHabit.id,
        userId: user.id,
      });

      const response = await request(app.getHttpServer())
        .get('/habit-logs')
        .query({ habitId: userHabit.id })
        .set('Cookie', userCookies)
        .expect(200);

      const body = response.body as HabitLogWithHabitDto[];
      expect(body.length).toBe(1);
      expect(body[0]?.habitId).toBe(userHabit.id);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer()).get('/habit-logs').expect(401);
    });
  });

  describe('/admin/habit-logs (GET)', () => {
    it('should filter by userId for an admin', async () => {
      await insertHabitLog(dbUtils, {
        habitId: userHabit.id,
        userId: user.id,
      });
      await insertHabitLog(dbUtils, {
        habitId: adminHabit.id,
        userId: admin.id,
      });

      const response = await request(app.getHttpServer())
        .get('/admin/habit-logs')
        .query({ userId: user.id })
        .set('Cookie', adminCookies)
        .expect(200);

      const body = response.body as HabitLogWithHabitDto[];
      expect(body.length).toBe(1);
      expect(body[0]?.userId).toBe(user.id);
    });

    it('should filter by habitId for an admin', async () => {
      const userHabit2 = await insertHabit(dbUtils, {
        name: 'user habit',
        userId: user.id,
      });
      await insertHabitLog(dbUtils, {
        habitId: userHabit.id,
        userId: user.id,
      });
      await insertHabitLog(dbUtils, {
        habitId: userHabit2.id,
        userId: user.id,
      });

      const response = await request(app.getHttpServer())
        .get('/admin/habit-logs')
        .query({ userId: user.id })
        .query({ habitId: userHabit.id })
        .set('Cookie', adminCookies)
        .expect(200);

      const body = response.body as HabitLogWithHabitDto[];
      expect(body.length).toBe(1);
      expect(body[0]?.habitId).toBe(userHabit.id);
    });

    it('should return 403 for a non-admin user', async () => {
      await request(app.getHttpServer())
        .get('/admin/habit-logs')
        .set('Cookie', userCookies)
        .expect(403);
    });

    it('should return 400 when userId is missing', async () => {
      await request(app.getHttpServer())
        .get('/admin/habit-logs')
        .set('Cookie', adminCookies)
        .expect(400);
    });
  });

  describe('/habit-logs/:id (GET)', () => {
    it('should return a specific habit log by id if it belongs to the user', async () => {
      const habitLog = await insertHabitLog(dbUtils, {
        habitId: userHabit.id,
        userId: user.id,
      });

      const response = await request(app.getHttpServer())
        .get(`/habit-logs/${habitLog.id}`)
        .set('Cookie', userCookies)
        .expect(200);

      expect((response.body as HabitLogDto).id).toBe(habitLog.id);
    });

    it('should return 404 if the habit log does not belong to the user', async () => {
      const habitLog = await insertHabitLog(dbUtils, {
        habitId: adminHabit.id,
        userId: admin.id,
      });

      await request(app.getHttpServer())
        .get(`/habit-logs/${habitLog.id}`)
        .set('Cookie', userCookies)
        .expect(404);
    });

    it('should allow an admin to get any habit log by id', async () => {
      const habitLog = await insertHabitLog(dbUtils, {
        habitId: userHabit.id,
        userId: user.id,
      });

      await request(app.getHttpServer())
        .get(`/admin/habit-logs/${habitLog.id}`)
        .set('Cookie', adminCookies)
        .expect(200);
    });
  });

  describe('/habit-logs/:id (PATCH)', () => {
    it('should update a habit log if it belongs to the user', async () => {
      const habitLog = await insertHabitLog(dbUtils, {
        habitId: userHabit.id,
        userId: user.id,
      });
      const updateDto = { value: 1 };

      const response = await request(app.getHttpServer())
        .patch(`/habit-logs/${habitLog.id}`)
        .set('Cookie', userCookies)
        .send(updateDto)
        .expect(200);

      expect((response.body as HabitLogDto).value).toBe(1);
    });

    it('should return 404 if trying to update a habit log that does not belong to the user', async () => {
      const habitLog = await insertHabitLog(dbUtils, {
        habitId: adminHabit.id,
        userId: admin.id,
      });
      const updateDto = { notes: 'new notes' };

      await request(app.getHttpServer())
        .patch(`/habit-logs/${habitLog.id}`)
        .set('Cookie', userCookies)
        .send(updateDto)
        .expect(404);
    });
  });

  describe('/habit-logs/:id (DELETE)', () => {
    it('should delete a habit log if it belongs to the user', async () => {
      const habitLog = await insertHabitLog(dbUtils, {
        habitId: userHabit.id,
        userId: user.id,
      });

      await request(app.getHttpServer())
        .delete(`/habit-logs/${habitLog.id}`)
        .set('Cookie', userCookies)
        .expect(200);

      const logs = await dbUtils.db
        .select()
        .from(habitLogsTable)
        .where(eq(habitLogsTable.id, habitLog.id));
      expect(logs.length).toBe(0);
    });

    it('should return 404 if trying to delete a habit log that does not belong to the user', async () => {
      const habitLog = await insertHabitLog(dbUtils, {
        habitId: adminHabit.id,
        userId: admin.id,
      });

      await request(app.getHttpServer())
        .delete(`/habit-logs/${habitLog.id}`)
        .set('Cookie', userCookies)
        .expect(404);
    });
  });
});
