import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { ValidateUser } from '@/types';

import { ProfileDto, UpdateProfileDto } from './dto/profile.dto';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @ZodResponse({ type: ProfileDto })
  @Get('me')
  async findOne(@CurrentUser() user: ValidateUser) {
    return this.profilesService.findOne(user.userId);
  }

  @ZodResponse({ type: ProfileDto })
  @Patch()
  async update(@CurrentUser() user: ValidateUser, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profilesService.update(user.userId, updateProfileDto);
  }
}
