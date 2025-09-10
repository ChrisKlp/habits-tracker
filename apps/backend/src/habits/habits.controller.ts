import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { HabitsService } from './habits.service';
import { CreateHabitDto, HabitDto, UpdateHabitDto } from './dto/habit.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { ValidateUser } from '@/types';

@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  async create(
    @CurrentUser() user: ValidateUser,
    @Body() createHabitDto: CreateHabitDto,
  ): Promise<HabitDto> {
    return this.habitsService.create(user.userId, createHabitDto);
  }

  @Get()
  async findAll(@CurrentUser() user: ValidateUser): Promise<HabitDto[]> {
    return this.habitsService.findAll(user.userId);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: ValidateUser,
    @Param('id') id: string,
  ): Promise<HabitDto> {
    return this.habitsService.findOne(id, user);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: ValidateUser,
    @Param('id') id: string,
    @Body() updateHabitDto: UpdateHabitDto,
  ): Promise<HabitDto> {
    return this.habitsService.update(id, updateHabitDto, user.userId);
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: ValidateUser,
    @Param('id') id: string,
  ): Promise<HabitDto> {
    return this.habitsService.remove(id, user.userId);
  }
}
