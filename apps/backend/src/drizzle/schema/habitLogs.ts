import { relations } from 'drizzle-orm';
import { integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { habitsTable } from './habits';

export const habitLogsTable = pgTable('habit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  value: integer('value').default(1).notNull(),

  habitId: uuid('habit_id')
    .notNull()
    .references(() => habitsTable.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const habitLogsRelations = relations(habitLogsTable, ({ one }) => ({
  habit: one(habitsTable, {
    fields: [habitLogsTable.habitId],
    references: [habitsTable.id],
  }),
}));
