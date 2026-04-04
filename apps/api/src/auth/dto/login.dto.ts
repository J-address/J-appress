import { loginSchema } from '@j-address/shared';
import { createZodDto } from 'nestjs-zod';

export class LoginDto extends createZodDto(loginSchema) {}
