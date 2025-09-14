import baseConfig from './base.mjs';

/** @type {import("prettier").Config} */
export default {
  ...baseConfig,
  importOrder: [
    '^@nestjs/(.*)$',
    '<THIRD_PARTY_MODULES>',
    '',
    '^@/(.*)$',
    '',
    '^[./]',
  ],
};
