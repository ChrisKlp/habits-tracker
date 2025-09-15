import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

import { passwordSchema } from '../utils/password.schema';

export const registerUserSchema = z.object({
  email: z.email(),
  password: passwordSchema,
});

export class RegisterUserDto extends createZodDto(registerUserSchema) {}
