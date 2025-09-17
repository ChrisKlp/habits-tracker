import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { ValidateUser } from '@/types';

import { CreateHabitDto, HabitDto, UpdateHabitDto } from './dto/habit.dto';
import { HabitsService } from './habits.service';

@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @ZodResponse({ type: HabitDto, status: HttpStatus.CREATED })
  @Post()
  async create(@CurrentUser() user: ValidateUser, @Body() createHabitDto: CreateHabitDto) {
    return this.habitsService.create(user.userId, createHabitDto);
  }

  @ZodResponse({ type: [HabitDto], status: HttpStatus.OK })
  @Get()
  async findAll(@CurrentUser() user: ValidateUser) {
    return this.habitsService.findAll(user.userId);
  }
  @ZodResponse({ type: HabitDto, status: HttpStatus.OK })
  @Get(':id')
  async findOne(@CurrentUser() user: ValidateUser, @Param('id') id: string) {
    return this.habitsService.findOne(id, user);
  }
  @ZodResponse({ type: HabitDto, status: HttpStatus.OK })
  @Patch(':id')
  async update(
    @CurrentUser() user: ValidateUser,
    @Param('id') id: string,
    @Body() updateHabitDto: UpdateHabitDto
  ) {
    return this.habitsService.update(id, updateHabitDto, user.userId);
  }
  @ZodResponse({ type: HabitDto, status: HttpStatus.OK })
  @Delete(':id')
  async remove(@CurrentUser() user: ValidateUser, @Param('id') id: string) {
    return this.habitsService.remove(id, user.userId);
  }
}
