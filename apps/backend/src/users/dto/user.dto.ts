import { usersTable } from '@/users/schema';
import { createSelectSchema } from 'drizzle-zod';
import { createZodDto } from 'nestjs-zod';

const userSelectSchema = createSelectSchema(usersTable);

export class UserDto extends createZodDto(userSelectSchema) {}
