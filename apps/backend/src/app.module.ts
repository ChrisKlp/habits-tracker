import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';

import { AuthModule } from './auth/auth.module';
import { DrizzleExceptionFilter } from './common/filters/drizzle-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { DrizzleModule } from './drizzle/drizzle.module';
import { SeedService } from './drizzle/seed.service';
import { HabitLogsModule } from './habit-logs/habit-logs.module';
import { HabitsModule } from './habits/habits.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DrizzleModule,
    UsersModule,
    AuthModule,
    HabitsModule,
    HabitLogsModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_FILTER, useClass: DrizzleExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    SeedService,
  ],
})
export class AppModule {}
