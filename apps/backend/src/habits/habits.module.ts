import { Module } from '@nestjs/common';

import { AdminHabitsController } from './admin-habits.controller';
import { HabitsController } from './habits.controller';
import { HabitsService } from './habits.service';

@Module({
  controllers: [HabitsController, AdminHabitsController],
  providers: [HabitsService],
})
export class HabitsModule {}
