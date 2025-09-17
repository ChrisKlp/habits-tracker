import { Body, Controller, HttpStatus, Param, Post } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

import { Roles } from '@/common/decorators/roles.decorator';

import { CreateProfileDto, ProfileDto } from './dto/profile.dto';
import { ProfilesService } from './profiles.service';

@Roles('admin')
@Controller('admin/profiles')
export class AdminProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @ZodResponse({ type: ProfileDto, status: HttpStatus.CREATED })
  @Post(':userId')
  async create(@Param('userId') userId: string, @Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(userId, createProfileDto);
  }
}
