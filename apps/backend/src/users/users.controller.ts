import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserDto } from './dto/user.dto';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('admin')
  @ZodSerializerDto([UserDto])
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Roles('admin')
  @ZodSerializerDto(UserDto)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
