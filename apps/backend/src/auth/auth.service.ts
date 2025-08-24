import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Drizzle } from '@/common/decorators/drizzle.decorator';
import { usersTable } from '@/users/schema';
import { eq } from 'drizzle-orm';
import { Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { hashValue, validateValue } from './utils/hash';
import { TokenService } from './token.service';
import { ConfigService } from '@nestjs/config';
import type { DeviceType } from '@/common/decorators/device.decorator';
import { ValidateUser } from '@/types';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @Drizzle() private readonly db: NodePgDatabase,
    private readonly tokenService: TokenService,
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async login(user: ValidateUser, device: DeviceType, response: Response) {
    const {
      accessToken,
      refreshToken,
      accessTokenExpiresTime,
      refreshTokenExpiresTime,
    } = await this.tokenService.createJwtToken(user);

    await this.tokenService.insertToken(user, device, refreshToken);

    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      expires: accessTokenExpiresTime,
      sameSite: 'none',
    });
    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      expires: refreshTokenExpiresTime,
      sameSite: 'none',
    });

    return user;
  }

  async register(registerDto: RegisterDto) {
    try {
      const [user] = await this.db
        .insert(usersTable)
        .values({
          email: registerDto.email,
          password: await hashValue(registerDto.password),
        })
        .returning();

      return user;
    } catch {
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async logout(user: ValidateUser) {
    await this.tokenService.removeToken(user);
  }

  async validateUser(email: string, password: string): Promise<ValidateUser> {
    try {
      const user = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1)
        .then(([user]) => user);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!(await validateValue(password, user.password))) {
        throw new UnauthorizedException('Credentials are not valid');
      }

      return { userId: user.id, role: user.role };
    } catch (err) {
      console.error(err);
      throw new UnauthorizedException('Credentials are not valid');
    }
  }

  async validateUserRefreshToken(
    refreshToken: string,
    userId: string,
  ): Promise<ValidateUser> {
    try {
      const user = await this.usersService.findOne(userId);
      const passport = await this.tokenService.findLastPassport(userId);

      if (!(await validateValue(refreshToken, passport.refreshToken))) {
        console.log(refreshToken, passport.refreshToken);
        throw new UnauthorizedException('Refresh token is not valid.');
      }
      return { userId: user.id, role: user.role };
    } catch (err) {
      console.error(err);
      throw new UnauthorizedException('Refresh token is not valid.');
    }
  }
}
