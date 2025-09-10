import { Module } from '@nestjs/common';
import { DrizzleModule } from './drizzle/drizzle.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { DrizzleExceptionFilter } from './common/filters/drizzle-exception.filter';
import { RolesGuard } from './common/guards/roles.guard';
import { HabitsModule } from './habits/habits.module';
import { SeedService } from './drizzle/seed.service';
import { HabitLogsModule } from './habit-logs/habit-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      global: true,
    }),
    DrizzleModule,
    UsersModule,
    AuthModule,
    HabitsModule,
    HabitLogsModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useExisting: JwtAuthGuard },
    { provide: APP_GUARD, useExisting: RolesGuard },
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_FILTER, useClass: DrizzleExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    JwtAuthGuard,
    RolesGuard,
    SeedService,
  ],
})
export class AppModule {}
