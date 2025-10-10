import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { ValidateUser } from '@/types';

import {
  CreateHabitLogDto,
  HabitLogDto,
  HabitLogWithHabitDto,
  UpdateHabitLogDto,
} from './dto/habit-log.dto';
import { HabitLogsService } from './habit-logs.service';

@Controller('habit-logs')
export class HabitLogsController {
  constructor(private readonly habitLogsService: HabitLogsService) {}

  @ZodResponse({ type: HabitLogDto, status: HttpStatus.CREATED })
  @Post()
  async create(@CurrentUser() user: ValidateUser, @Body() createHabitLogDto: CreateHabitLogDto) {
    return this.habitLogsService.create(createHabitLogDto, user.userId);
  }

  @ZodResponse({ type: [HabitLogWithHabitDto], status: HttpStatus.OK })
  @ApiQuery({ name: 'habit_id', required: false, type: String })
  @ApiQuery({ name: 'date', required: false, type: String })
  @Get()
  findAll(
    @CurrentUser() user: ValidateUser,
    @Query('habit_id') habitId?: string,
    @Query('date') date?: string
  ) {
    return this.habitLogsService.findAll({
      userId: user.userId,
      habitId,
      date,
    });
  }

  @ZodResponse({ type: HabitLogWithHabitDto, status: HttpStatus.OK })
  @Get(':id')
  findOne(@CurrentUser() user: ValidateUser, @Param('id') id: string) {
    return this.habitLogsService.findOne(id, user);
  }

  @ZodResponse({ type: HabitLogDto, status: HttpStatus.OK })
  @Patch(':id')
  update(
    @CurrentUser() user: ValidateUser,
    @Param('id') id: string,
    @Body() updateHabitLogDto: UpdateHabitLogDto
  ) {
    return this.habitLogsService.update(id, updateHabitLogDto, user.userId);
  }

  @ZodResponse({ type: HabitLogDto, status: HttpStatus.OK })
  @Delete(':id')
  remove(@CurrentUser() user: ValidateUser, @Param('id') id: string): Promise<HabitLogDto> {
    return this.habitLogsService.remove(id, user.userId);
  }
}
