import { Drizzle } from '@/common/decorators/drizzle.decorator';
import { JwtPayload, ValidateUser } from '@/types';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { passportTable } from './schema';
import { DeviceType } from '@/common/decorators/device.decorator';
import { desc, eq } from 'drizzle-orm';
import { hashValue } from './utils/hash';
import { NotFoundException } from '@nestjs/common';

export class TokenService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    @Drizzle() private readonly db: NodePgDatabase,
  ) {}

  async generateTokens(user: ValidateUser) {
    const payload: JwtPayload = {
      sub: user.userId,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow('ACCESS_TOKEN_SECRET'),
        expiresIn: `${this.config.getOrThrow('ACCESS_TOKEN_EXPIRATION_MS')}ms`,
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow('REFRESH_TOKEN_SECRET'),
        expiresIn: `${this.config.getOrThrow('REFRESH_TOKEN_EXPIRATION_MS')}ms`,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  generateExpiresTime(expiresInMs: number) {
    const date = new Date();
    date.setTime(date.getTime() + expiresInMs);
    return date;
  }

  async createJwtToken(user: ValidateUser) {
    const { accessToken, refreshToken } = await this.generateTokens(user);
    const accessTokenExpiresTime = this.generateExpiresTime(
      parseInt(this.config.getOrThrow('ACCESS_TOKEN_EXPIRATION_MS')),
    );
    const refreshTokenExpiresTime = this.generateExpiresTime(
      parseInt(this.config.getOrThrow('REFRESH_TOKEN_EXPIRATION_MS')),
    );

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresTime,
      refreshTokenExpiresTime,
    };
  }

  async insertToken(
    user: ValidateUser,
    device: DeviceType,
    refreshToken: string,
  ) {
    const now = new Date();
    await this.db.insert(passportTable).values({
      userId: user.userId,
      ip: device.ip,
      refreshToken: await hashValue(refreshToken),
      createdAt: now,
      updatedAt: now,
      deviceType: device.deviceType,
      deviceName: device.deviceName,
      deviceOs: device.deviceOs,
      browser: device.browser,
    });
  }

  async findLastPassport(userId: string) {
    try {
      const passport = await this.db
        .select()
        .from(passportTable)
        .where(eq(passportTable.userId, userId))
        .orderBy(desc(passportTable.createdAt))
        .limit(1)
        .then(([passport]) => passport);

      if (!passport) {
        throw new Error();
      }

      return passport;
    } catch {
      throw new NotFoundException();
    }
  }

  async removeToken(user: ValidateUser) {
    await this.db
      .delete(passportTable)
      .where(eq(passportTable.userId, user.userId));
  }
}
