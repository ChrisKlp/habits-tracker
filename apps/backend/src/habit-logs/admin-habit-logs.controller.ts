import { Roles } from '@/common/decorators/roles.decorator';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { HabitLogsService } from './habit-logs.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { ValidateUser } from '@/types';
import { HabitLogWithHabitDto } from './dto/habit-log.dto';
import { ZodResponse } from 'nestjs-zod';

@Roles('admin')
@Controller('admin/habit-logs')
export class AdminHabitLogsController {
  constructor(private readonly habitLogsService: HabitLogsService) {}

  @ZodResponse({ type: [HabitLogWithHabitDto] })
  @Get()
  findAll(
    @Query('habitId') habitId?: string,
    @Query('date') date?: string,
    @Query('userId') userId?: string,
  ) {
    return this.habitLogsService.findAll({ userId, habitId, date });
  }

  @ZodResponse({ type: HabitLogWithHabitDto })
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: ValidateUser) {
    return this.habitLogsService.findOne(id, user);
  }
}
