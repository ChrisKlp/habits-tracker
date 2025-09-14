import { createSelectSchema } from 'drizzle-zod';
import { createZodDto } from 'nestjs-zod';

import { usersTable } from '@/drizzle/schema/users';

const userSelectSchema = createSelectSchema(usersTable).omit({
  password: true,
});

export class UserDto extends createZodDto(userSelectSchema) {}
