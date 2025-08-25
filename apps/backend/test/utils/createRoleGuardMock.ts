export const createRoleGuardMock = (canActivate = true) => ({
  canActivate: () => canActivate,
});
