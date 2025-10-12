import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import type { ValidateUser } from '@/types';

import { HabitLogWithHabitDto } from './dto/habit-log.dto';
import { HabitLogsService } from './habit-logs.service';

@Roles('admin')
@Controller('admin/habit-logs')
export class AdminHabitLogsController {
  constructor(private readonly habitLogsService: HabitLogsService) {}

  @ZodResponse({ type: [HabitLogWithHabitDto], status: HttpStatus.OK })
  @Get()
  findAll(
    @Query('habit_id') habitId?: string,
    @Query('date') date?: string,
    @Query('user_id') userId?: string
  ) {
    return this.habitLogsService.findAll({ userId, habitId, date });
  }

  @ZodResponse({ type: HabitLogWithHabitDto, status: HttpStatus.OK })
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: ValidateUser) {
    return this.habitLogsService.findOne(id, user);
  }
}
