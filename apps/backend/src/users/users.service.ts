import { Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Drizzle } from 'src/common/decorators/drizzle.decorator';
import { usersTable } from './schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(@Drizzle() private readonly db: NodePgDatabase) {}

  async findAll() {
    return this.db.select().from(usersTable);
  }

  async findOne(id: string) {
    try {
      const user = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, id))
        .limit(1)
        .then(([user]) => user);

      if (!user) {
        throw new Error();
      }

      return user;
    } catch {
      throw new NotFoundException('User not found');
    }
  }
}
