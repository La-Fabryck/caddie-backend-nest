import { defineConfig } from 'oxlint';
import { unicornRecommendedOxlintRules } from './oxlint.unicorn-recommended.rules.mjs';

/**
 * Port of the former `eslint.config.mjs` (recommended + `typescript-eslint` strictTypeChecked
 * merge + explicit `rules` + unicorn + import).
 * TypeScript rules use the `typescript/` prefix per Oxc docs.
 * Unicorn: explicit `unicornRecommendedOxlintRules` mirrors eslint-plugin-unicorn `configs.recommended`
 * for rules Oxlint implements (see `oxlint.unicorn-recommended.rules.mjs` for the 12 missing upstream rules).
 * Gaps (no Oxlint rule yet): `@typescript-eslint/method-signature-style`, `require-atomic-updates`,
 * `unused-imports/no-unused-imports` (approximated via `import/no-unassigned-import`).
 */
export default defineConfig({
  env: {
    builtin: true,
    node: true,
    jest: true,
  },
  plugins: [
    'typescript',
    'unicorn',
    'oxc',
    'import',
    'jest',
    'node',
    'promise',
  ],
  categories: {
    correctness: 'error',
    suspicious: 'error',
  },
  rules: {
    // --- Matches former "off" / disabled ---
    'typescript/unified-signatures': 'off',
    'typescript/explicit-function-return-type': 'off',
    'typescript/explicit-module-boundary-types': 'off',
    'typescript/restrict-template-expressions': 'off',
    'no-magic-numbers': 'off',
    'no-unused-vars': 'off',
    'no-empty-function': 'off',

    // --- Former @typescript-eslint (typescript plugin) ---
    'typescript/no-explicit-any': 'error',
    'typescript/no-deprecated': 'error',
    'typescript/no-empty-function': 'error',
    'typescript/consistent-indexed-object-style': 'error',
    'typescript/prefer-enum-initializers': 'error',
    'typescript/no-use-before-define': 'error',
    'typescript/promise-function-async': 'error',
    'typescript/strict-boolean-expressions': 'error',
    'typescript/no-extraneous-class': ['error', { allowWithDecorator: true }],
    'typescript/no-unused-vars': [
      'error',
      {
        args: 'all',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    'typescript/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
      },
    ],
    'typescript/consistent-type-exports': [
      'error',
      { fixMixedExportsWithInlineTypeSpecifier: true },
    ],
    'typescript/no-import-type-side-effects': 'error',
    'typescript/default-param-last': 'error',
    'typescript/no-magic-numbers': ['error', { ignore: [0] }],

    // --- Former eslint core ---
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    yoda: ['error', 'never'],
    'no-await-in-loop': 'error',
    'no-else-return': 'error',
    'func-style': ['error', 'declaration'],
    'default-case': 'error',
    'default-case-last': 'error',
    'max-params': ['error', 3],
    'no-array-constructor': 'error',
    'no-bitwise': 'error',
    'no-alert': 'error',
    'no-caller': 'error',
    'no-extend-native': 'error',
    'no-eval': 'error',
    'no-extra-bind': 'error',
    'no-implicit-coercion': 'error',
    // eslint-plugin-unicorn recommended: use `unicorn/no-nested-ternary` instead of the core rule.
    'no-nested-ternary': 'off',
    'no-negated-condition': 'off',
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-script-url': 'error',
    'no-unneeded-ternary': 'error',
    'no-useless-call': 'error',
    'no-duplicate-imports': 'error',

    // --- eslint-plugin-import (Oxlint `import` plugin) ---
    'import/no-unassigned-import': 'error',
    'import/extensions': [
      'error',
      'ignorePackages',
      { ts: 'never', mts: 'never', cts: 'never' },
    ],
    'import/exports-last': 'error',
    'import/default': 'error',
    'import/first': ['error', 'disable-absolute-first'],
    'import/group-exports': 'error',
    'import/named': 'error',
    'import/namespace': 'error',
    'import/no-amd': 'error',
    'import/no-commonjs': 'error',

    // --- eslint-plugin-node (Oxlint `node` plugin) ---
    'node/handle-callback-err': 'error',
    'node/no-exports-assign': 'error',
    'node/no-new-require': 'error',
    'node/no-path-concat': 'error',
    'node/no-process-env': 'error',

    // --- eslint-plugin-unicorn `recommended` (Oxlint-implemented rules only; excludes `no-null` and `prefer-top-level-await`) ---
    ...unicornRecommendedOxlintRules,
  },
  overrides: [
    {
      files: ['oxlint.config.mjs'],
      rules: {
        'typescript/no-magic-numbers': 'off',
        'no-magic-numbers': 'off',
      },
    },
    {
      files: ['src/config/**/*.ts', '.config/**/*.ts', 'test/jest.setup.ts'],
      rules: {
        // Nest `registerAs` / CLI / Jest setup read env at the boundary; rest of `src` should use `ConfigService`.
        'node/no-process-env': 'off',
      },
    },
    {
      files: ['migrations/**/*.ts', '**/*.d.ts'],
      rules: {
        // Kysely `up`/`down` and generated `.d.ts` use multiple export declarations.
        'import/exports-last': 'off',
        'import/group-exports': 'off',
        // Timestamp-prefixed migration filenames are not kebab-case.
        'unicorn/filename-case': 'off',
      },
    },
  ],
  ignorePatterns: ['dist/**', 'coverage/**', 'node_modules/**'],
});
