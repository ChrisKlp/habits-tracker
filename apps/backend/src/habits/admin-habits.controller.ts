import { Controller, Get, Param } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { HabitDto } from './dto/habit.dto';
import type { ValidateUser } from '@/types';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Roles('admin')
@Controller('admin/habits')
export class AdminHabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get()
  async findAll(): Promise<HabitDto[]> {
    return this.habitsService.findAllAsAdmin();
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: ValidateUser,
    @Param('id') id: string,
  ): Promise<HabitDto> {
    return this.habitsService.findOne(id, user);
  }
}
