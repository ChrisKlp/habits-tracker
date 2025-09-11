import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Device, type DeviceType } from '@/common/decorators/device.decorator';
import { Public } from '@/common/decorators/public.decorator';
import type { ValidateUser } from '@/types';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtRefreshAuthGuard } from '@/common/guards/jwt-refresh-auth.guard';
import { ZodResponse } from 'nestjs-zod';
import { UserDto } from '@/users/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: ValidateUser,
    @Device() device: DeviceType,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, device, response);
  }

  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  async refreshToken(
    @CurrentUser() user: ValidateUser,
    @Device() device: DeviceType,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, device, response);
  }

  @ZodResponse({ type: UserDto })
  @Roles('admin')
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(
    @CurrentUser() user: ValidateUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.Refresh as string;
    await this.authService.logout(user, refreshToken);
    res.clearCookie('Authentication');
    res.clearCookie('Refresh');
  }
}
