import { habitsTable } from '@/drizzle/schema';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { createZodDto } from 'nestjs-zod';

export const habitSelectSchema = createSelectSchema(habitsTable);
const habitInsertSchema = createInsertSchema(habitsTable).omit({
  id: true,
  userId: true,
  createdAt: true,
});
const habitUpdateSchema = createUpdateSchema(habitsTable).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export class HabitDto extends createZodDto(habitSelectSchema) {}
export class CreateHabitDto extends createZodDto(habitInsertSchema) {}
export class UpdateHabitDto extends createZodDto(habitUpdateSchema) {}
