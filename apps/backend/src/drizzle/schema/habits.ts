import { relations } from 'drizzle-orm';
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { usersTable } from './users';
import { habitLogsTable } from './habitLogs';

export const habitsTable = pgTable('habits', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  color: varchar('color', { length: 30 }),
  icon: text('icon'),
  description: text('description'),
  archived: boolean('archived').default(false),

  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const habitsRelations = relations(habitsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [habitsTable.userId],
    references: [usersTable.id],
  }),
  logs: many(habitLogsTable),
}));
