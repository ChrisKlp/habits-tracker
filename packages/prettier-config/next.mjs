import baseConfig from './base.mjs';

/** @type {import("prettier").Config} */
export default {
  ...baseConfig,
  plugins: [...baseConfig.plugins, 'prettier-plugin-tailwindcss'],
  importOrder: [
    '^(react/(.*)$)|^(react$)',
    '^(next/(.*)$)|^(next$)',
    '',
    '<THIRD_PARTY_MODULES>',
    '',
    '^@/(.*)',
    '^[./]',
  ],
  tailwindFunctions: ['clsx', 'cn', 'cva'],
};
