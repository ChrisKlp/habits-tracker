import { relations } from 'drizzle-orm';
import { varchar, text, pgTable } from 'drizzle-orm/pg-core';
import { sessionsTable } from './sessions';
import { profilesTable } from './profiles';
import { habitsTable } from './habits';
import { idColumn, timestampColumns } from '../utils/commonColumns';

export const usersTable = pgTable('users', {
  ...idColumn,
  ...timestampColumns,

  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  role: varchar('role', { length: 255 }).notNull().default('user'),
});

export const usersRelations = relations(usersTable, ({ many, one }) => ({
  sessions: many(sessionsTable),
  profile: one(profilesTable, {
    fields: [usersTable.id],
    references: [profilesTable.userId],
  }),
  habits: many(habitsTable),
}));
