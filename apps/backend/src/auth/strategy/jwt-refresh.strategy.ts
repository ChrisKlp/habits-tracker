import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';

import { JwtPayload } from '@/types';

import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => (request.cookies?.Refresh as string | undefined) ?? null,
      ]),
      secretOrKey: configService.getOrThrow('REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: JwtPayload, done: VerifiedCallback) {
    const user = await this.authService.validateUserRefreshToken(
      payload.sub,
      request.cookies?.Refresh as string
    );
    return done(null, user);
  }
}
