import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserDto } from './dto/user.dto';
import { ZodResponse } from 'nestjs-zod';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ZodResponse({ type: [UserDto] })
  @Roles('admin')
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @ZodResponse({ type: UserDto })
  @Roles('admin')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
