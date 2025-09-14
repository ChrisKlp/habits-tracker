import { relations } from 'drizzle-orm';
import { pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { idColumn, timestampColumns } from '../utils/commonColumns';
import { habitsTable } from './habits';
import { profilesTable } from './profiles';
import { sessionsTable } from './sessions';

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
