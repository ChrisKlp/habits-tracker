import { Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Drizzle } from 'src/common/decorators/drizzle.decorator';
import { usersTable } from './schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(@Drizzle() private readonly db: NodePgDatabase) {}

  findAll() {
    return this.db.select().from(usersTable);
  }

  findOne(id: string) {
    return this.db.select().from(usersTable).where(eq(usersTable.id, id));
  }
}
