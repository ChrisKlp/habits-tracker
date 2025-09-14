import baseConfig from './base.mjs';

/** @typedef  {import("prettier").Config} PrettierConfig */
/** @typedef {import("prettier-plugin-tailwindcss").PluginOptions} TailwindConfig */
/** @typedef  {import("@trivago/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig } */
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
