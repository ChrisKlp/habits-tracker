import { UnauthorizedException } from '@nestjs/common';

export const createJwtGuardMock = (canActivate = true) => ({
  canActivate: () => {
    if (!canActivate) {
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  },
});
