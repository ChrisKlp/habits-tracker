import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateHabitDto, UpdateHabitDto } from './dto/habit.dto';
import { Drizzle } from '@/common/decorators/drizzle.decorator';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { habitsTable } from '@/drizzle/schema';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class HabitsService {
  constructor(@Drizzle() private readonly db: NodePgDatabase) {}

  async create(userId: string, createHabitDto: CreateHabitDto) {
    return this.db
      .insert(habitsTable)
      .values({
        ...createHabitDto,
        userId,
      })
      .returning()
      .then(([habit]) => habit);
  }

  async findAll() {
    return this.db.select().from(habitsTable);
  }

  async findMyHabits(userId: string) {
    return this.db
      .select()
      .from(habitsTable)
      .where(eq(habitsTable.userId, userId));
  }

  async findOneAsAdmin(id: string) {
    return this.db
      .select()
      .from(habitsTable)
      .where(eq(habitsTable.id, id))
      .limit(1)
      .then(([habit]) => habit);
  }

  async findOne(userId: string, id: string) {
    try {
      const habit = await this.db
        .select()
        .from(habitsTable)
        .where(and(eq(habitsTable.userId, userId), eq(habitsTable.id, id)))
        .limit(1)
        .then(([habit]) => habit);

      if (!habit) {
        throw new NotFoundException();
      }

      return habit;
    } catch {
      throw new NotFoundException('Habit not found');
    }
  }

  async update(userId: string, id: string, updateHabitDto: UpdateHabitDto) {
    const [habit] = await this.db
      .update(habitsTable)
      .set(updateHabitDto)
      .where(and(eq(habitsTable.id, id), eq(habitsTable.userId, userId)))
      .returning();

    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    return habit;
  }

  async remove(userId: string, id: string) {
    const [habit] = await this.db
      .delete(habitsTable)
      .where(and(eq(habitsTable.id, id), eq(habitsTable.userId, userId)))
      .returning();

    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    return habit;
  }
}
