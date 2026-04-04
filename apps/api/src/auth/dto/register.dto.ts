import { createZodDto } from 'nestjs-zod';
import { registerSchema } from '@j-address/shared';

export class RegisterDto extends createZodDto(registerSchema) {}
