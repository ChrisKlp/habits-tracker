import { usersTable } from 'src/users/schema';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .regex(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter',
  })
  .regex(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' })
  .regex(/[^a-zA-Z0-9]/, {
    message: 'Password must contain at least one special character',
  });

const userSelectSchema = createSelectSchema(usersTable);
const userInsertSchema = createInsertSchema(usersTable, {
  password: () => passwordSchema,
});
const userUpdateSchema = createUpdateSchema(usersTable, {
  password: () => passwordSchema,
});

export class UserDto extends createZodDto(userSelectSchema) {}
export class CreateUserDto extends createZodDto(userInsertSchema) {}
export class UpdateUserDto extends createZodDto(userUpdateSchema) {}
