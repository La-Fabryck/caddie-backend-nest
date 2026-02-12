// @ts-check
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintPluginPerfectionist from 'eslint-plugin-perfectionist';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['eslint.config.mjs', './dist/*', './coverage/*'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  eslintPluginPrettierRecommended,
  eslintPluginUnicorn.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },

      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },

    plugins: {
      perfectionist: eslintPluginPerfectionist,
      'unused-imports': unusedImports,
    },

    rules: {
      // Turned off for eslint@9.39.0
      // @see https://github.com/eslint/eslint/issues/20272
      '@typescript-eslint/unified-signatures': 'off',

      // @typescript-eslint rules ----->
      '@typescript-eslint/interface-name-prefix': 'off',

      // TODO: turn on
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-deprecated': 'error',

      // No magic numbers
      'no-magic-numbers': 'off',
      '@typescript-eslint/no-magic-numbers': ['error', { ignore: [0] }], // ignore array index and params with 0 as default value

      // Disallow empty functions
      'no-empty-function': 'off',
      '@typescript-eslint/no-empty-function': 'error',

      // Enforce using a particular method signature syntax
      '@typescript-eslint/method-signature-style': 'error',

      // Enforce default parameters to be last
      'default-param-last': 'off',
      '@typescript-eslint/default-param-last': 'error',

      // Require the Record type
      '@typescript-eslint/consistent-indexed-object-style': 'error',

      // Require each enum member value to be explicitly initialized
      '@typescript-eslint/prefer-enum-initializers': 'error',

      // Disallow the use of variables before they are defined
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': 'error',

      // Require any function or method that returns a Promise to be marked async.
      '@typescript-eslint/promise-function-async': 'error',

      // Disallow certain types in boolean expressions
      '@typescript-eslint/strict-boolean-expressions': 'error',

      // Disallow classes used as namespaces.
      // Override typescript-eslint strict to allow empty Module classes with decorators
      '@typescript-eslint/no-extraneous-class': [
        'error',
        {
          /** Whether to allow extraneous classes that include a decorator. */
          allowWithDecorator: true,
        },
      ],

      // Enforce template literal expressions to be of `string` type
      // Override typescript-eslint strictTyped to remove this rule.
      '@typescript-eslint/restrict-template-expressions': 'off',

      // Disallow unused variables.
      // Override typescript-eslint recommended config to allow unused variables starting with _
      // Note: you must disable the base rule as it can report incorrect errors
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
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

      // <----- @typescript-eslint rules

      // unicorn rules ----->

      'unicorn/no-null': 'off',
      'unicorn/prevent-abbreviations': [
        'error',
        {
          ignore: ['\\.e2e(-spec)?$'],
        },
      ],
      'unicorn/explicit-length-check': 'off',

      // <----- unicorn rules

      // eslint rules ----->

      eqeqeq: ['error', 'always', { null: 'ignore' }],
      yoda: ['error', 'never'],

      // Disallow await inside of loops
      'no-await-in-loop': 'error',

      // Disallow else blocks after return statements in if statements
      'no-else-return': 'error',

      // Enforce consistent function declarations as `function xyz()`
      'func-style': ['error', 'declaration'],

      // Require default cases in switch statements
      'default-case': 'error',
      'default-case-last': 'error',

      // Disallow assignments that can lead to race conditions due to usage of `await` or `yield`
      'require-atomic-updates': ['error', { allowProperties: true }],

      // Enforce a maximum number of parameters in function definitions
      'max-params': ['error', 3],

      // Disallow `Array` constructors
      'no-array-constructor': 'error',

      // Disallow bitwise operators
      'no-bitwise': 'error',

      // Disallow the use of alert, confirm, and prompt
      'no-alert': 'error',

      // Disallow the use of `arguments.caller` or `arguments.callee`
      'no-caller': 'error',

      // Disallow extending native types such as Object.prototype.extra = 55;
      'no-extend-native': 'error',

      // Disallow the use of eval()
      'no-eval': 'error',

      // Disallow unnecessary calls to .bind()
      'no-extra-bind': 'error',

      // Disallow shorthand type conversions, use explicit functions
      'no-implicit-coercion': 'error',

      // Disallow nested ternary expressions
      'no-nested-ternary': 'error',

      // Disallow the unary operators ++ and --
      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],

      // Disallow javascript: URLs. ex: location.href = "javascript:void(0)";
      'no-script-url': 'error',

      // Disallow ternary operators when simpler alternatives exist
      'no-unneeded-ternary': 'error',

      // Disallow unnecessary calls to `.call()` and `.apply()`
      'no-useless-call': 'error',

      // <----- eslint rules

      // Force type imports:
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          "prefer": "type-imports",
          "fixStyle": "separate-type-imports"
        }
      ],
      "@typescript-eslint/consistent-type-exports": [
        "error",
        { "fixMixedExportsWithInlineTypeSpecifier": true }
      ],
      "no-duplicate-imports": "error",
      "@typescript-eslint/no-import-type-side-effects": "error",

      // Sort imports (perfectionist replaces import-x/order)
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
          ignoreCase: true,
          internalPattern: ['^~/.+', '^@/.+'],
          // Type and value together per category → alphabetical by path (e.g. @faker before @prisma)
          groups: [
            ['type-builtin', 'value-builtin'],
            ['type-external', 'value-external'],
            ['type-internal', 'value-internal'],
            ['type-parent', 'type-sibling', 'type-index', 'value-parent', 'value-sibling', 'value-index'],
            'ts-equals-import',
            'unknown',
          ],
          newlinesBetween: 'ignore',
          tsconfig: {
            rootDir: import.meta.dirname,
            filename: 'tsconfig.json',
          },
        },
      ],

      // Find and remove unused es6 module imports
      'unused-imports/no-unused-imports': 'error',
    },
  },
);
