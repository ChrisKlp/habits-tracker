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
import { CreateHabitDto, UpdateHabitDto } from './dto/habit.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { ValidateUser } from '@/types';

@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  async create(
    @CurrentUser() user: ValidateUser,
    @Body() createHabitDto: CreateHabitDto,
  ) {
    return this.habitsService.create(user.userId, createHabitDto);
  }

  @Roles('admin')
  @Get()
  async findAll() {
    return this.habitsService.findAll();
  }

  @Get('my')
  async findMyHabits(@CurrentUser() user: ValidateUser) {
    return this.habitsService.findMyHabits(user.userId);
  }

  @Roles('admin')
  @Get('admin/:id')
  async findOneAsAdmin(@Param('id') id: string) {
    return this.habitsService.findOneAsAdmin(id);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: ValidateUser, @Param('id') id: string) {
    return this.habitsService.findOne(user.userId, id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: ValidateUser,
    @Param('id') id: string,
    @Body() updateHabitDto: UpdateHabitDto,
  ) {
    return this.habitsService.update(user.userId, id, updateHabitDto);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: ValidateUser, @Param('id') id: string) {
    return this.habitsService.remove(user.userId, id);
  }
}
