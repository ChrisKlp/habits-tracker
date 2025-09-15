import createClient from 'openapi-fetch';

import { paths } from '../generated/openapi';

export const api = createClient<paths>({ baseUrl: process.env.NEXT_PUBLIC_API_URL });
