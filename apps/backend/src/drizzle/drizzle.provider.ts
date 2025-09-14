import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import schema, { type Schema } from './schema';

export const DRIZZLE_PROVIDER = 'DRIZZLE_PROVIDER';

export const drizzleProvider = {
  provide: DRIZZLE_PROVIDER,
  useFactory: (config: ConfigService) => {
    const pool = new Pool({
      connectionString: config.getOrThrow('DATABASE_URL'),
    });

    return drizzle(pool, { schema }) as NodePgDatabase<Schema>;
  },
  inject: [ConfigService],
};
