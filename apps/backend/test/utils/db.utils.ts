import { getTableName, isTable } from 'drizzle-orm';
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import path from 'path';
import schema from '../../src/drizzle/schema';
import { hashValue } from '../../src/auth/utils/hash';
import { mockPassword } from './auth.utils';

export type DbUtils = {
  db: NodePgDatabase<typeof schema>;
  pool: Pool;
};

export const setupTestDb = async (): Promise<DbUtils> => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool, { schema });

  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), 'drizzle'),
  });

  return { db, pool };
};

export const truncateAllTables = async ({ db }: Pick<DbUtils, 'db'>) => {
  const tableNames = Object.values(schema)
    .filter((o) => isTable(o))
    .map((o) => getTableName(o));
  for (const tableName of tableNames) {
    await db.execute(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`);
  }
};

export const cleanupDb = async ({ db, pool }: DbUtils) => {
  await truncateAllTables({ db });
  await pool.end();
};

type CreateUserDto = Omit<typeof schema.usersTable.$inferInsert, 'password'> & {
  password?: string;
};

export const createUser = async (
  { db }: Pick<DbUtils, 'db'>,
  user: CreateUserDto,
) => {
  const hashedPassword = await hashValue(mockPassword);
  return db
    .insert(schema.usersTable)
    .values({
      ...user,
      password: hashedPassword,
    })
    .returning();
};
