import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Drizzle } from '@/common/decorators/drizzle.decorator';
import { Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { hashValue, validateValue } from './utils/hash';
import { TokenService } from './token.service';
import { ConfigService } from '@nestjs/config';
import type { DeviceType } from '@/common/decorators/device.decorator';
import { ValidateUser } from '@/types';
import { UsersService } from '@/users/users.service';
import { usersTable } from '@/drizzle/schema';
import { SessionService } from './session.service';

@Injectable()
export class AuthService {
  constructor(
    @Drizzle() private readonly db: NodePgDatabase,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
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

  async logout(user: ValidateUser, refreshToken: string) {
    const currentSession = await this.sessionService.validateSession(
      user.userId,
      refreshToken,
    );
    await this.sessionService.removeSession(currentSession.id);
  }

  async validateUser(email: string, password: string): Promise<ValidateUser> {
    try {
      const user = await this.usersService.findByEmail(email);

      if (!(await validateValue(password, user.password))) {
        throw new UnauthorizedException('Credentials are not valid');
      }

      return { userId: user.id, role: user.role };
    } catch {
      throw new UnauthorizedException('Credentials are not valid');
    }
  }

  async validateUserRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<ValidateUser> {
    try {
      const user = await this.usersService.findOne(userId);
      await this.sessionService.validateSession(userId, refreshToken);

      return { userId: user.id, role: user.role };
    } catch {
      throw new UnauthorizedException('Refresh token is not valid.');
    }
  }
}
