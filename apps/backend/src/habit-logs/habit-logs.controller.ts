import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { HabitLogsService } from './habit-logs.service';
import {
  CreateHabitLogDto,
  HabitLogDto,
  UpdateHabitLogDto,
} from './dto/habit-log.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { ValidateUser } from '@/types';
import { HabitLogWithHabitDto } from './types';

@Controller('habit-logs')
export class HabitLogsController {
  constructor(private readonly habitLogsService: HabitLogsService) {}

  @Post()
  async create(@Body() createHabitLogDto: CreateHabitLogDto) {
    return this.habitLogsService.create(createHabitLogDto);
  }

  @Get()
  findAll(
    @CurrentUser() user: ValidateUser,
    @Query('habitId') habitId?: string,
    @Query('date') date?: string,
  ): Promise<HabitLogWithHabitDto[]> {
    return this.habitLogsService.findAll({
      userId: user.userId,
      habitId,
      date,
    });
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: ValidateUser,
    @Param('id') id: string,
  ): Promise<HabitLogWithHabitDto> {
    return this.habitLogsService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: ValidateUser,
    @Param('id') id: string,
    @Body() updateHabitLogDto: UpdateHabitLogDto,
  ): Promise<HabitLogDto> {
    return this.habitLogsService.update(id, updateHabitLogDto, user.userId);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: ValidateUser,
    @Param('id') id: string,
  ): Promise<HabitLogDto> {
    return this.habitLogsService.remove(id, user.userId);
  }
}
