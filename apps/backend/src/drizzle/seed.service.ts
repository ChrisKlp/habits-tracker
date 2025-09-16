import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { hashValue } from '@/auth/utils/hash';
import { Drizzle } from '@/common/decorators/drizzle.decorator';

import { habitLogsTable, habitsTable, profilesTable, usersTable } from './schema';

type User = typeof usersTable.$inferSelect;
type Habit = typeof habitsTable.$inferSelect;

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @Drizzle() private readonly db: NodePgDatabase,
    private readonly config: ConfigService
  ) {}

  async onModuleInit() {
    if (this.config.get('NODE_ENV') === 'development') {
      await this.seed();
    }
  }

  private async seed() {
    await this.seedAdmin();
    await this.seedUser();
  }

  private async seedAdmin() {
    try {
      let [admin] = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, 'admin@test.com'))
        .limit(1);

      if (!admin) {
        const hashedPassword = await hashValue('admin123');

        [admin] = await this.db
          .insert(usersTable)
          .values({
            email: 'admin@test.com',
            password: hashedPassword,
            role: 'admin',
          })
          .returning();

        this.logger.log('Admin user created successfully');
      } else {
        this.logger.log('Admin user already exists');
      }
      await this.seedProfileForUser(admin!, { displayName: 'Admin' });
    } catch (error) {
      this.logger.error('Failed to seed admin user', error);
    }
  }

  private async seedUser() {
    try {
      let [user] = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, 'user@test.com'))
        .limit(1);

      if (!user) {
        const hashedPassword = await hashValue('user123');

        [user] = await this.db
          .insert(usersTable)
          .values({
            email: 'user@test.com',
            password: hashedPassword,
            role: 'user',
          })
          .returning();

        this.logger.log('Regular user created successfully');
      } else {
        this.logger.log('Regular user already exists');
      }

      await this.seedUserData(user!);
    } catch (error) {
      this.logger.error('Failed to seed user', error);
    }
  }

  private async seedUserData(user: User) {
    await this.seedProfileForUser(user);
    const habits = await this.seedHabitsForUser(user);
    if (habits.length > 0) {
      await this.seedHabitLogsForUser(user, habits);
    }
  }

  private async seedProfileForUser(
    user: User,
    profileData: Partial<typeof profilesTable.$inferInsert> = {}
  ) {
    try {
      const existingProfile = await this.db
        .select({ id: profilesTable.id })
        .from(profilesTable)
        .where(eq(profilesTable.userId, user.id))
        .limit(1);

      if (existingProfile.length === 0) {
        await this.db.insert(profilesTable).values({
          userId: user.id,
          displayName: 'Test User',
          avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
          ...profileData,
        });
        this.logger.log(`Profile for user ${user.email} created`);
      } else {
        this.logger.log(`Profile for user ${user.email} already exists`);
      }
    } catch (error) {
      this.logger.error(`Failed to seed profile for user ${user.email}`, error);
    }
  }

  private async seedHabitsForUser(user: User): Promise<Habit[]> {
    try {
      const existingHabits = await this.db
        .select()
        .from(habitsTable)
        .where(eq(habitsTable.userId, user.id));

      if (existingHabits.length > 0) {
        this.logger.log(`Habits for user ${user.email} already exist`);
        return existingHabits;
      }

      const habitsToInsert = [
        {
          name: 'Read a book',
          color: '#FFD700',
          icon: 'book',
          description: 'Read for 30 minutes every day',
          userId: user.id,
        },
        {
          name: 'Workout',
          color: '#FF6347',
          icon: 'fitness',
          description: 'Go to the gym or do a home workout',
          userId: user.id,
        },
        {
          name: 'Meditate',
          color: '#87CEEB',
          icon: 'self_improvement',
          description: 'Meditate for 10 minutes',
          userId: user.id,
        },
        {
          name: 'Drink water',
          color: '#20B2AA',
          icon: 'water_drop',
          description: 'Drink 8 glasses of water',
          userId: user.id,
        },
      ];

      const insertedHabits = await this.db.insert(habitsTable).values(habitsToInsert).returning();
      this.logger.log(`Habits for user ${user.email} created`);
      return insertedHabits;
    } catch (error) {
      this.logger.error(`Failed to seed habits for user ${user.email}`, error);
      return [];
    }
  }

  private async seedHabitLogsForUser(user: User, habits: Habit[]) {
    try {
      const existingLogs = await this.db
        .select({ id: habitLogsTable.id })
        .from(habitLogsTable)
        .where(eq(habitLogsTable.userId, user.id))
        .limit(1);

      if (existingLogs.length > 0) {
        this.logger.log(`Habit logs for user ${user.email} already exist`);
        return;
      }

      const logsToInsert: (typeof habitLogsTable.$inferInsert)[] = [];
      const today = new Date();
      for (const habit of habits) {
        for (let i = 0; i < 30; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);

          if (Math.random() > 0.3) {
            logsToInsert.push({
              habitId: habit.id,
              userId: user.id,
              date: date.toISOString().split('T')[0]!,
              value: Math.floor(Math.random() * 5) + 1,
            });
          }
        }
      }

      if (logsToInsert.length > 0) {
        await this.db.insert(habitLogsTable).values(logsToInsert);
        this.logger.log(`Habit logs for user ${user.email} created`);
      }
    } catch (error) {
      this.logger.error(`Failed to seed habit logs for user ${user.email}`, error);
    }
  }
}
