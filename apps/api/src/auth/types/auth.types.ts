import { Role } from '../../../generated/prisma';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
}
