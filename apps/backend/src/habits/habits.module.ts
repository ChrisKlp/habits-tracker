import { Module } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { HabitsController } from './habits.controller';
import { AdminHabitsController } from './admin-habits.controller';

@Module({
  controllers: [HabitsController, AdminHabitsController],
  providers: [HabitsService],
})
export class HabitsModule {}
