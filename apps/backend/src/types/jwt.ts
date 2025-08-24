export interface JwtPayload {
  sub: string;
  role: string;
  exp?: number;
  iat?: number;
}

export interface TCurrentUser {
  userId: string;
  role: string;
}
