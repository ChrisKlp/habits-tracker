import { relations } from 'drizzle-orm';
import { pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';

import { idColumn, timestampColumns } from '../utils/commonColumns';
import { usersTable } from './users';

export const profilesTable = pgTable('profiles', {
  ...idColumn,
  ...timestampColumns,

  displayName: varchar('displayName', { length: 255 }).notNull(),
  avatar: text('avatar'),

  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
});

export const profilesRelations = relations(profilesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [profilesTable.userId],
    references: [usersTable.id],
  }),
}));
