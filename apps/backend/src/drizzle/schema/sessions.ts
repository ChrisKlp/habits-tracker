import { relations } from 'drizzle-orm';
import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { idColumn, timestampColumns } from '../utils/commonColumns';
import { usersTable } from './users';

export const sessionsTable = pgTable('sessions', {
  ...idColumn,
  ...timestampColumns,

  ip: text('ip').default('unknown'),
  location: text('location').default('unknown'),
  deviceOs: text('device_os').default('unknown'),
  deviceName: text('device_name').default('unknown'),
  deviceType: text('device_type').default('unknown'),
  browser: text('browser').default('unknown'),
  userAgent: text('user_agent').default('unknown'),
  refreshToken: text('refresh_token').notNull(),

  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
});

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}));
