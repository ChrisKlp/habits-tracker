import { Module } from '@nestjs/common';

import { AdminHabitLogsController } from './admin-habit-logs.controller';
import { HabitLogsController } from './habit-logs.controller';
import { HabitLogsService } from './habit-logs.service';

@Module({
  controllers: [HabitLogsController, AdminHabitLogsController],
  providers: [HabitLogsService],
})
export class HabitLogsModule {}
