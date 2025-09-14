import { timestamp, uuid } from 'drizzle-orm/pg-core';

export const idColumn = {
  id: uuid('id').primaryKey().defaultRandom(),
};

export const timestampColumns = {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .$onUpdate(() => new Date().toISOString()),
};
