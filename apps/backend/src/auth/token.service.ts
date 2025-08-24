import { Drizzle } from '@/common/decorators/drizzle.decorator';
import { JwtPayload, ValidateUser } from '@/types';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

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
}
