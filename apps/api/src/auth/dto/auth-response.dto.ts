import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../generated/prisma';

export class UserResponse {
  @ApiProperty({ example: 'uuid-123' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role!: Role;
}

export class AuthResponse {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token!: string;

  @ApiProperty({ type: UserResponse })
  user!: UserResponse;
}

export class LoginSignupResponse {
  @ApiProperty({ type: UserResponse })
  user!: UserResponse;
}
