import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { createZodDto } from 'nestjs-zod';

import { profilesTable } from '@/drizzle/schema';

export const profileSelectSchema = createSelectSchema(profilesTable);
const profileInsertSchema = createInsertSchema(profilesTable).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});
const profileUpdateSchema = createUpdateSchema(profilesTable).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export class ProfileDto extends createZodDto(profileSelectSchema) {}
export class CreateProfileDto extends createZodDto(profileInsertSchema) {}
export class UpdateProfileDto extends createZodDto(profileUpdateSchema) {}
