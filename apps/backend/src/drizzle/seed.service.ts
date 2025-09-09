// src/database/seed.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { usersTable } from './schema';
import { Drizzle } from '@/common/decorators/drizzle.decorator';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { hashValue } from '@/auth/utils/hash';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @Drizzle() private readonly db: NodePgDatabase,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    if (this.config.get('NODE_ENV') === 'development') {
      await this.seedAdmin();
    }
  }

  private async seedAdmin() {
    try {
      const existingAdmin = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, 'admin@test.com'))
        .limit(1);

      if (existingAdmin.length === 0) {
        const hashedPassword = await hashValue('admin123');

        await this.db.insert(usersTable).values({
          email: 'admin@test.com',
          password: hashedPassword,
          role: 'admin',
        });

        this.logger.log('Admin user created successfully');
      } else {
        this.logger.log('Admin user already exists');
      }
    } catch (error) {
      this.logger.error('Failed to seed admin user', error);
    }
  }
}
