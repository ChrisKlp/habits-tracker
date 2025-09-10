import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateHabitLogDto, UpdateHabitLogDto } from './dto/habit-log.dto';
import { Drizzle } from '@/common/decorators/drizzle.decorator';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { habitLogsTable, habitsTable } from '@/drizzle/schema';
import { and, desc, eq, getTableColumns, gte, lt, SQL } from 'drizzle-orm';
import { ValidateUser } from '@/types';

interface FindAllFilters {
  habitId?: string;
  userId?: string;
  date?: string;
}

@Injectable()
export class HabitLogsService {
  constructor(@Drizzle() private readonly db: NodePgDatabase) {}

  async create(createHabitLogDto: CreateHabitLogDto) {
    return this.db
      .insert(habitLogsTable)
      .values(createHabitLogDto)
      .returning()
      .then(([habitLog]) => habitLog);
  }

  async findAll({ habitId, userId, date }: FindAllFilters) {
    const conditions: SQL<unknown>[] = [];

    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    if (userId) {
      conditions.push(eq(habitLogsTable.userId, userId));
    }

    if (habitId) {
      conditions.push(eq(habitLogsTable.habitId, habitId));
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);

      conditions.push(gte(habitLogsTable.date, startOfDay));
      conditions.push(lt(habitLogsTable.date, nextDay));
    }

    return this.db
      .select({
        ...getTableColumns(habitLogsTable),
        habit: {
          id: habitsTable.id,
          name: habitsTable.name,
          color: habitsTable.color,
          icon: habitsTable.icon,
          archived: habitsTable.archived,
        },
      })
      .from(habitLogsTable)
      .leftJoin(habitsTable, eq(habitLogsTable.habitId, habitsTable.id))
      .where(and(...conditions))
      .orderBy(desc(habitLogsTable.date));
  }

  async findOne(id: string, user: ValidateUser) {
    try {
      const conditions = [eq(habitLogsTable.id, id)];

      if (user && user.role !== 'admin') {
        conditions.push(eq(habitLogsTable.userId, user.userId));
      }

      const [habitLog] = await this.db
        .select({
          ...getTableColumns(habitLogsTable),
          habit: {
            id: habitsTable.id,
            name: habitsTable.name,
            color: habitsTable.color,
            icon: habitsTable.icon,
            archived: habitsTable.archived,
          },
        })
        .from(habitLogsTable)
        .leftJoin(habitsTable, eq(habitLogsTable.habitId, habitsTable.id))
        .where(and(...conditions))
        .limit(1);

      if (!habitLog) {
        throw new NotFoundException();
      }

      return habitLog;
    } catch {
      throw new NotFoundException('Habit log not found');
    }
  }

  async update(
    id: string,
    updateHabitLogDto: UpdateHabitLogDto,
    userId: string,
  ) {
    const [habitLog] = await this.db
      .update(habitLogsTable)
      .set(updateHabitLogDto)
      .where(and(eq(habitLogsTable.id, id), eq(habitLogsTable.userId, userId)))
      .returning();

    if (!habitLog) {
      throw new NotFoundException('Habit not found');
    }

    return habitLog;
  }

  async remove(id: string, userId: string) {
    const [habit] = await this.db
      .delete(habitLogsTable)
      .where(and(eq(habitLogsTable.id, id), eq(habitLogsTable.userId, userId)))
      .returning();

    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    return habit;
  }
}
