import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Response } from 'express';

import type { DeviceType } from '@/common/decorators/device.decorator';
import { Drizzle } from '@/common/decorators/drizzle.decorator';
import { usersTable } from '@/drizzle/schema';
import { ProfilesService } from '@/profiles/profiles.service';
import { ValidateUser } from '@/types';
import { UsersService } from '@/users/users.service';

import { RegisterUserDto } from './dto/register.dto';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { hashValue, validateValue } from './utils/hash';

@Injectable()
export class AuthService {
  constructor(
    @Drizzle() private readonly db: NodePgDatabase,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
    private readonly profilesService: ProfilesService
  ) {}

  async login(user: ValidateUser, device: DeviceType, response: Response) {
    const { accessToken, refreshToken, accessTokenExpiresTime, refreshTokenExpiresTime } =
      await this.tokenService.createJwtToken(user);

    await this.sessionService.addSession(user.userId, device, refreshToken);

    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      expires: accessTokenExpiresTime,
    });
    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      expires: refreshTokenExpiresTime,
    });

    return user;
  }

  async register(registerDto: RegisterUserDto) {
    try {
      const [user] = await this.db
        .insert(usersTable)
        .values({
          email: registerDto.email,
          password: await hashValue(registerDto.password),
        })
        .returning();

      if (!user) {
        throw new Error('Could not create user with given data');
      }

      const displayName = registerDto.email.split('@')[0] as string;
      await this.profilesService.create(user.id, { displayName });

      return user;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async logout(user: ValidateUser, refreshToken: string) {
    const currentSession = await this.sessionService.validateSession(user.userId, refreshToken);
    await this.sessionService.removeSession(currentSession.id);
  }

  async validateUser(email: string, password: string): Promise<ValidateUser> {
    try {
      const user = await this.usersService.findByEmail(email);

      if (!(await validateValue(password, user.password))) {
        throw new UnauthorizedException('Credentials are not valid');
      }

      return { userId: user.id, role: user.role as 'user' | 'admin' };
    } catch {
      throw new UnauthorizedException('Credentials are not valid');
    }
  }

  async validateUserRefreshToken(userId: string, refreshToken: string): Promise<ValidateUser> {
    try {
      const user = await this.usersService.findOne(userId);
      await this.sessionService.validateSession(userId, refreshToken);

      return { userId: user.id, role: user.role as 'user' | 'admin' };
    } catch {
      throw new UnauthorizedException('Refresh token is not valid.');
    }
  }
}
