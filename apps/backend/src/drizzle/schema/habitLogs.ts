import { relations } from 'drizzle-orm';
import { integer, pgTable, uuid, date } from 'drizzle-orm/pg-core';
import { habitsTable } from './habits';
import { usersTable } from './users';
import { idColumn, timestampColumns } from '../utils/commonColumns';

export const habitLogsTable = pgTable('habit_logs', {
  ...idColumn,
  ...timestampColumns,

  date: date('date').notNull(),
  value: integer('value').default(0).notNull(),

  habitId: uuid('habit_id')
    .notNull()
    .references(() => habitsTable.id, { onDelete: 'cascade' }),

  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
});

export const habitLogsRelations = relations(habitLogsTable, ({ one }) => ({
  habit: one(habitsTable, {
    fields: [habitLogsTable.habitId],
    references: [habitsTable.id],
  }),
  user: one(usersTable, {
    fields: [habitLogsTable.userId],
    references: [usersTable.id],
  }),
}));
