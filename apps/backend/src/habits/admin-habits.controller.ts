import { Controller, Get, Param } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import type { ValidateUser } from '@/types';

import { HabitDto } from './dto/habit.dto';
import { HabitsService } from './habits.service';

@Roles('admin')
@Controller('admin/habits')
export class AdminHabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @ZodResponse({ type: [HabitDto] })
  @Get()
  async findAll() {
    return this.habitsService.findAllAsAdmin();
  }

  @ZodResponse({ type: HabitDto })
  @Get(':id')
  async findOne(@CurrentUser() user: ValidateUser, @Param('id') id: string) {
    return this.habitsService.findOne(id, user);
  }
}
