import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Device, type DeviceType } from '@/common/decorators/device.decorator';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { UserDto } from '@/users/dto/user.dto';
import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: UserDto,
    @Device() device: DeviceType,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, device, response);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
