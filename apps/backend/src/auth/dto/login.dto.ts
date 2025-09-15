import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const loginUserSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export class LoginUserDto extends createZodDto(loginUserSchema) {}
