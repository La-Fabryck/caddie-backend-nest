import { defineConfig } from 'oxfmt';

/**
 * Oxfmt configuration. Edit formatting and import line order here.
 *
 * @see docs/oxlint-migrate.md
 */
export default defineConfig({
  singleQuote: true,
  sortImports: {
    internalPattern: ['@/', 'test/'],
    newlinesBetween: false,
    groups: [
      ['type-builtin', 'value-builtin'],
      ['type-external', 'value-external'],
      ['type-internal', 'value-internal'],
      ['type-parent', 'type-sibling', 'type-index', 'value-parent', 'value-sibling', 'value-index'],
      'unknown',
    ],
  },
  sortPackageJson: true,
  trailingComma: 'all',
});
