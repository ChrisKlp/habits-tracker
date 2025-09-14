import { relations } from 'drizzle-orm';
import { boolean, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';

import { idColumn, timestampColumns } from '../utils/commonColumns';
import { habitLogsTable } from './habitLogs';
import { usersTable } from './users';

export const habitsTable = pgTable('habits', {
  ...idColumn,
  ...timestampColumns,

  name: varchar('name', { length: 255 }).notNull(),
  color: varchar('color', { length: 30 }),
  icon: text('icon'),
  description: text('description'),
  archived: boolean('archived').default(false),

  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
});

export const habitsRelations = relations(habitsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [habitsTable.userId],
    references: [usersTable.id],
  }),
  logs: many(habitLogsTable),
}));
