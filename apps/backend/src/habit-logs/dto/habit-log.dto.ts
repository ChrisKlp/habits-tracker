import { habitLogsTable } from '@/drizzle/schema';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { createZodDto } from 'nestjs-zod';

const habitLogSelectSchema = createSelectSchema(habitLogsTable);
const habitLogInsertSchema = createInsertSchema(habitLogsTable).omit({
  id: true,
  createdAt: true,
});
const habitLogUpdateSchema = createUpdateSchema(habitLogsTable).omit({
  id: true,
  createdAt: true,
});

export class HabitLogDto extends createZodDto(habitLogSelectSchema) {}
export class CreateHabitLogDto extends createZodDto(habitLogInsertSchema) {}
export class UpdateHabitLogDto extends createZodDto(habitLogUpdateSchema) {}
