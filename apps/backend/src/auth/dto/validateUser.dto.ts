import { createSelectSchema } from 'drizzle-zod';
import { createZodDto } from 'nestjs-zod';

import { usersTable } from '@/drizzle/schema';

const validateUserSchema = createSelectSchema(usersTable).pick({
  id: true,
  email: true,
  role: true,
});

export class ValidateUserDto extends createZodDto(validateUserSchema) {}
