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
import { hashPassword, validatePassword } from './utils/password';
import { TokenService } from './token.service';
import { ConfigService } from '@nestjs/config';
import type { DeviceType } from '@/common/decorators/device.decorator';
import { passportTable } from './schema';
import { ValidateUser } from '@/types';

@Injectable()
export class AuthService {
  constructor(
    @Drizzle() private readonly db: NodePgDatabase,
    private readonly tokenService: TokenService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<ValidateUser> {
    try {
      const user = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1)
        .then(([user]) => user);

      if (!user) {
        throw new NotFoundException();
      }

      if (!(await validatePassword(password, user.password))) {
        throw new UnauthorizedException();
      }

      return { userId: user.id, role: user.role };
    } catch {
      throw new UnauthorizedException('Credentials are not valid');
    }
  }

  async login(user: ValidateUser, device: DeviceType, response: Response) {
    const {
      accessToken,
      refreshToken,
      accessTokenExpiresTime,
      refreshTokenExpiresTime,
    } = await this.tokenService.createJwtToken(user);

    const now = new Date();
    await this.db.insert(passportTable).values({
      userId: user.userId,
      ip: device.ip,
      refreshToken,
      createdAt: now,
      updatedAt: now,
      deviceType: device.deviceType,
      deviceName: device.deviceName,
      deviceOs: device.deviceOs,
      browser: device.browser,
    });

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
          password: await hashPassword(registerDto.password),
        })
        .returning();

      return user;
    } catch {
      throw new InternalServerErrorException('Failed to register user');
    }
  }
}
