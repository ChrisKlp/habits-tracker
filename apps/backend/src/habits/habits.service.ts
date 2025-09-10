import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateHabitDto, UpdateHabitDto } from './dto/habit.dto';
import { Drizzle } from '@/common/decorators/drizzle.decorator';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { habitsTable } from '@/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { ValidateUser } from '@/types';

@Injectable()
export class HabitsService {
  constructor(@Drizzle() private readonly db: NodePgDatabase) {}

  async create(userId: string, createHabitDto: CreateHabitDto) {
    const [habit] = await this.db
      .insert(habitsTable)
      .values({
        ...createHabitDto,
        userId,
      })
      .returning();

    if (!habit) {
      throw new BadRequestException('Could not create habit with given data');
    }

    return habit;
  }

  async findAllAsAdmin() {
    return this.db.select().from(habitsTable);
  }

  async findAll(userId: string) {
    return this.db
      .select()
      .from(habitsTable)
      .where(eq(habitsTable.userId, userId));
  }

  async findOne(id: string, user: ValidateUser) {
    try {
      const conditions = [eq(habitsTable.id, id)];

      if (user && user.role !== 'admin') {
        conditions.push(eq(habitsTable.userId, user.userId));
      }

      const habit = await this.db
        .select()
        .from(habitsTable)
        .where(and(...conditions))
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

  async update(id: string, updateHabitDto: UpdateHabitDto, userId: string) {
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

  async remove(id: string, userId: string) {
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
