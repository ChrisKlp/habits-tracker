import { Inject } from '@nestjs/common';

import { DRIZZLE_PROVIDER } from '@/drizzle/drizzle.provider';

export const Drizzle = () => Inject(DRIZZLE_PROVIDER);
