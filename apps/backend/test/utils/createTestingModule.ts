import { AppModule } from '@/app.module';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Test } from '@nestjs/testing';
import { createJwtGuardMock } from './createJwtGuardMock';
import { createRoleGuardMock } from './createRoleGuardMock';

export async function createTestingModule(
  moduleToOverride: any,
  mockServiceToOverride: any,
  authenticated = true,
  authorized = true,
) {
  return Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(JwtAuthGuard)
    .useValue(createJwtGuardMock(authenticated))
    .overrideProvider(RolesGuard)
    .useValue(createRoleGuardMock(authorized))
    .overrideProvider(moduleToOverride)
    .useValue(mockServiceToOverride)
    .compile();
}
