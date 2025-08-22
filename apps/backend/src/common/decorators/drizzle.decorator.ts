import { Inject } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from 'src/drizzle/drizzle.provider';

export const Drizzle = () => Inject(DRIZZLE_PROVIDER);
