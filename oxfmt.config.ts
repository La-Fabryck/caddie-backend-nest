import { defineConfig } from 'oxfmt';

/**
 * Oxfmt configuration.
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
  overrides: [
    {
      files: ['*.md'],
      options: {
        // editorconfig `max_line_length = off` is not numeric, so oxfmt would else use 100
        printWidth: 140,
        proseWrap: 'preserve',
      },
    },
  ],
});
