import { Module } from '@nestjs/common';
import { HabitLogsService } from './habit-logs.service';
import { HabitLogsController } from './habit-logs.controller';
import { AdminHabitLogsController } from './admin-habit-logs.controller';

@Module({
  controllers: [HabitLogsController, AdminHabitLogsController],
  providers: [HabitLogsService],
})
export class HabitLogsModule {}
