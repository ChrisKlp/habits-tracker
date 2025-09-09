import { DRIZZLE_PROVIDER } from '@/drizzle/drizzle.provider';
import { HabitDto } from '@/habits/dto/habit.dto';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { loginUser, userIds } from './utils/auth.utils';
import {
  cleanupDb,
  DbUtils,
  createUser,
  setupTestDb,
  truncateAllTables,
} from './utils/db.utils';
import { habitsTable } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

type CreateHabitDto = typeof habitsTable.$inferInsert;

const insertHabit = async (
  { db }: Pick<DbUtils, 'db'>,
  habit: CreateHabitDto,
) => {
  const [newHabit] = await db.insert(habitsTable).values(habit).returning();

  if (!newHabit) {
    throw new Error('Failed to create habit');
  }

  return newHabit;
};

describe('HabitsController (e2e)', () => {
  let app: INestApplication<App>;
  let dbUtils: DbUtils;
  let adminCookies: string[];
  let userCookies: string[];

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

    await createUser(dbUtils, {
      id: userIds.admin,
      email: 'admin@test.com',
      role: 'admin',
    });
    await createUser(dbUtils, {
      id: userIds.user,
      email: 'user@test.com',
      role: 'user',
    });

    adminCookies = await loginUser(app, { email: 'admin@test.com' });
    userCookies = await loginUser(app, { email: 'user@test.com' });
  });

  afterAll(async () => {
    await cleanupDb(dbUtils);
    await app.close();
  });

  describe('/habits (POST)', () => {
    it('should create a new habit for the current user', async () => {
      const createHabitDto = {
        name: 'Read a book',
        description: 'Read 20 pages',
      };

      const response = await request(app.getHttpServer())
        .post('/habits')
        .set('Cookie', userCookies)
        .send(createHabitDto)
        .expect(201);

      const body = response.body as HabitDto;
      expect(body.name).toBe(createHabitDto.name);
      expect(body.userId).toBe(userIds.user);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/habits')
        .send({ name: 'test' })
        .expect(401);
    });
  });

  describe('/habits/mine (GET)', () => {
    it('should return only the habits for the current user', async () => {
      await dbUtils.db.insert(habitsTable).values([
        { name: 'user habit', userId: userIds.user },
        { name: 'admin habit', userId: userIds.admin },
      ]);

      const response = await request(app.getHttpServer())
        .get('/habits/my')
        .set('Cookie', userCookies)
        .expect(200);

      const body = response.body as HabitDto[];
      expect(body.length).toBe(1);
      expect(body[0]?.name).toBe('user habit');
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer()).get('/habits/my').expect(401);
    });
  });

  describe('/habits (GET)', () => {
    it('should return all habits for an admin user', async () => {
      await dbUtils.db.insert(habitsTable).values([
        { name: 'user habit', userId: userIds.user },
        { name: 'admin habit', userId: userIds.admin },
      ]);

      const response = await request(app.getHttpServer())
        .get('/habits')
        .set('Cookie', adminCookies)
        .expect(200);

      const body = response.body as HabitDto[];
      expect(body.length).toBe(2);
    });

    it('should return 403 for a non-admin user', async () => {
      await request(app.getHttpServer())
        .get('/habits')
        .set('Cookie', userCookies)
        .expect(403);
    });
  });

  describe('/habits/:id (GET)', () => {
    it('should return a specific habit by id if it belongs to the user', async () => {
      const habit = await insertHabit(dbUtils, {
        name: 'test habit',
        userId: userIds.user,
      });

      const response = await request(app.getHttpServer())
        .get(`/habits/${habit.id}`)
        .set('Cookie', userCookies)
        .expect(200);

      expect((response.body as HabitDto).id).toBe(habit.id);
    });

    it('should return 404 if the habit does not belong to the user', async () => {
      const habit = await insertHabit(dbUtils, {
        name: 'admin habit',
        userId: userIds.admin,
      });

      await request(app.getHttpServer())
        .get(`/habits/${habit.id}`)
        .set('Cookie', userCookies)
        .expect(404);
    });

    it('should allow an admin to get any habit by id', async () => {
      const habit = await insertHabit(dbUtils, {
        name: 'user habit',
        userId: userIds.user,
      });

      await request(app.getHttpServer())
        .get(`/habits/admin/${habit.id}`)
        .set('Cookie', adminCookies)
        .expect(200);
    });
  });

  describe('/habits/:id (PATCH)', () => {
    it('should update a habit if it belongs to the user', async () => {
      const habit = await insertHabit(dbUtils, {
        name: 'old name',
        userId: userIds.user,
      });
      const updateDto = { name: 'new name' };

      const response = await request(app.getHttpServer())
        .patch(`/habits/${habit.id}`)
        .set('Cookie', userCookies)
        .send(updateDto)
        .expect(200);

      expect((response.body as HabitDto).name).toBe('new name');
    });

    it('should return 404 if trying to update a habit that does not belong to the user', async () => {
      const habit = await insertHabit(dbUtils, {
        name: 'admin habit',
        userId: userIds.admin,
      });
      const updateDto = { name: 'new name' };

      await request(app.getHttpServer())
        .patch(`/habits/${habit.id}`)
        .set('Cookie', userCookies)
        .send(updateDto)
        .expect(404);
    });
  });

  describe('/habits/:id (DELETE)', () => {
    it('should delete a habit if it belongs to the user', async () => {
      const habit = await insertHabit(dbUtils, {
        name: 'to delete',
        userId: userIds.user,
      });

      await request(app.getHttpServer())
        .delete(`/habits/${habit.id}`)
        .set('Cookie', userCookies)
        .expect(200);

      const habits = await dbUtils.db
        .select()
        .from(habitsTable)
        .where(eq(habitsTable.id, habit.id));
      expect(habits.length).toBe(0);
    });

    it('should return 404 if trying to delete a habit that does not belong to the user', async () => {
      const habit = await insertHabit(dbUtils, {
        name: 'admin habit',
        userId: userIds.admin,
      });

      await request(app.getHttpServer())
        .delete(`/habits/${habit.id}`)
        .set('Cookie', userCookies)
        .expect(404);
    });
  });
});
