import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ZodResponse } from 'nestjs-zod';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Device, type DeviceType } from '@/common/decorators/device.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtRefreshAuthGuard } from '@/common/guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import type { ValidateUser } from '@/types';
import { UserDto } from '@/users/dto/user.dto';

import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register.dto';
import { ValidateUserDto } from './dto/validateUser.dto';

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
    @Body() _loginDto: LoginUserDto
  ) {
    return this.authService.login(user, device, response);
  }

  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  async refreshToken(
    @CurrentUser() user: ValidateUser,
    @Device() device: DeviceType,
    @Res({ passthrough: true }) response: Response
  ) {
    return this.authService.login(user, device, response);
  }

  @ZodResponse({ type: UserDto, status: HttpStatus.CREATED })
  @Roles('admin')
  @Post('register')
  async register(@Body() registerDto: RegisterUserDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(
    @CurrentUser() user: ValidateUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies?.Refresh as string;
    res.clearCookie('Authentication');
    res.clearCookie('Refresh');
    await this.authService.logout(user, refreshToken);
  }

  @ZodResponse({ type: ValidateUserDto, status: HttpStatus.OK })
  @Get('me')
  async getMe(@CurrentUser() user: ValidateUser) {
    return this.authService.getMe(user.userId);
  }
}
