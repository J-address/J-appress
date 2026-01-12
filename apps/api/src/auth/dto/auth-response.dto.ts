import { Role } from '../../../generated/prisma';

/**
 * User information returned in auth responses (signup/login)
 * Excludes sensitive data like password
 */
export class UserResponse {
  id: string;
  email: string;
  role: Role;
}

/**
 * Response returned from signup and login endpoints
 */
export class AuthResponse {
  access_token: string;
  user: UserResponse;
}
