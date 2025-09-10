export interface JwtPayload {
  sub: string;
  role: string;
  exp?: number;
  iat?: number;
}

export interface ValidateUser {
  userId: string;
  role: 'user' | 'admin';
}
