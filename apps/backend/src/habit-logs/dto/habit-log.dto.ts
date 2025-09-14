import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { createZodDto } from 'nestjs-zod';

import { habitLogsTable } from '@/drizzle/schema';
import { habitSelectSchema } from '@/habits/dto/habit.dto';

const habitLogSelectSchema = createSelectSchema(habitLogsTable);
const habitLogInsertSchema = createInsertSchema(habitLogsTable).omit({
  id: true,
  userId: true,
  createdAt: true,
});
const habitLogUpdateSchema = createUpdateSchema(habitLogsTable).omit({
  id: true,
  userId: true,
  createdAt: true,
});

const habitLogWithHabitSchema = habitLogSelectSchema.extend({
  habit: habitSelectSchema
    .pick({
      id: true,
      name: true,
      color: true,
      icon: true,
      archived: true,
    })
    .nullable(),
});

export class HabitLogDto extends createZodDto(habitLogSelectSchema) {}
export class CreateHabitLogDto extends createZodDto(habitLogInsertSchema) {}
export class UpdateHabitLogDto extends createZodDto(habitLogUpdateSchema) {}
export class HabitLogWithHabitDto extends createZodDto(habitLogWithHabitSchema) {}
