import { HabitDto } from '@/habits/dto/habit.dto';
import { HabitLogDto } from '../dto/habit-log.dto';

export interface HabitLogWithHabitDto extends HabitLogDto {
  habit: Pick<HabitDto, 'id' | 'name' | 'color' | 'icon' | 'archived'> | null;
}
