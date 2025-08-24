import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { UserDto } from '@/users/dto/user.dto';
import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Device, type DeviceType } from '@/common/decorators/device.decorator';
import { Public } from '@/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
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
