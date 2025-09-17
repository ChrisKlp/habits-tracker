import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { ProfilesModule } from '@/profiles/profiles.module';
import { UsersModule } from '@/users/users.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { JwtRefreshStrategy } from './strategy/jwt-refresh.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import { TokenService } from './token.service';

@Module({
  imports: [UsersModule, PassportModule, JwtModule, ProfilesModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    TokenService,
    SessionService,
  ],
})
export class AuthModule {}
