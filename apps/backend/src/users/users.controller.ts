import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

import { Roles } from '@/common/decorators/roles.decorator';

import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ZodResponse({ type: [UserDto], status: HttpStatus.OK })
  @Roles('admin')
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @ZodResponse({ type: UserDto, status: HttpStatus.OK })
  @Roles('admin')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
