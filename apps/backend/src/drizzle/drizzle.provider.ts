import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as userSchema from '@/users/schema';

export const DRIZZLE_PROVIDER = 'DRIZZLE_PROVIDER';

const schema = {
  ...userSchema,
};

export const drizzleProvider = {
  provide: DRIZZLE_PROVIDER,
  useFactory: (config: ConfigService) => {
    const pool = new Pool({
      connectionString: config.getOrThrow('DATABASE_URL'),
    });

    return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
  },
  inject: [ConfigService],
};
