import { eq, getTableName, isTable } from 'drizzle-orm';
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import path from 'path';
import schema, { habitLogsTable, habitsTable } from '../../src/drizzle/schema';
import { hashValue } from '../../src/auth/utils/hash';
import { mockAdmin, mockPassword, mockUser, mockUser2 } from './auth.utils';
import { HabitDto } from '@/habits/dto/habit.dto';
import { HabitLogDto } from '@/habit-logs/dto/habit-log.dto';

type CreateHabitDto = typeof habitsTable.$inferInsert;
type CreateHabitLogDto = typeof habitLogsTable.$inferInsert;

export type DbUtils = {
  db: NodePgDatabase<typeof schema>;
  pool: Pool;
};

export async function setupTestDb(): Promise<DbUtils> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool, { schema });

  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), 'drizzle'),
  });

  return { db, pool };
}

export async function truncateAllTables({ db }: Pick<DbUtils, 'db'>) {
  const tableNames = Object.values(schema)
    .filter((o) => isTable(o))
    .map((o) => getTableName(o));
  for (const tableName of tableNames) {
    await db.execute(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`);
  }
}

export async function cleanupDb({ db, pool }: DbUtils) {
  await truncateAllTables({ db });
  await pool.end();
}

type CreateUserDto = Omit<typeof schema.usersTable.$inferInsert, 'password'> & {
  password?: string;
};

export async function insertUser(
  { db }: Pick<DbUtils, 'db'>,
  user: CreateUserDto,
) {
  const hashedPassword = await hashValue(mockPassword);
  const [newUser] = await db
    .insert(schema.usersTable)
    .values({
      ...user,
      password: hashedPassword,
    })
    .returning();

  if (!newUser) {
    throw new Error('Failed to create user');
  }

  return newUser;
}

export async function createAdmin(dbUtils: DbUtils) {
  return insertUser(dbUtils, mockAdmin);
}

export async function createUser(dbUtils: DbUtils) {
  return insertUser(dbUtils, mockUser);
}

export async function createUser2(dbUtils: DbUtils) {
  return insertUser(dbUtils, mockUser2);
}

export async function findUserByEmail(
  { db }: Pick<DbUtils, 'db'>,
  email: string,
) {
  const user = await db
    .select()
    .from(schema.usersTable)
    .where(eq(schema.usersTable.email, email))
    .limit(1)
    .then(([user]) => user);

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

export async function insertHabit(
  { db }: Pick<DbUtils, 'db'>,
  habit: CreateHabitDto,
): Promise<HabitDto> {
  const [newHabit] = await db.insert(habitsTable).values(habit).returning();

  if (!newHabit) {
    throw new Error('Failed to create habit');
  }

  return newHabit;
}

export async function insertHabitLog(
  { db }: Pick<DbUtils, 'db'>,
  habitLog: Omit<CreateHabitLogDto, 'date'> & { date?: string },
): Promise<HabitLogDto> {
  const [newHabitLog] = await db
    .insert(habitLogsTable)
    .values({
      ...habitLog,
      date: habitLog.date ?? new Date().toISOString(),
    })
    .returning();

  if (!newHabitLog) {
    throw new Error('Failed to create habit log');
  }

  return newHabitLog;
}
