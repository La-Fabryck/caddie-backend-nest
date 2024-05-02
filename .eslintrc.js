module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:import/errors',
    'plugin:import/warnings'
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'sort-imports': [
      'error',
      {
        'ignoreCase': true,
        'ignoreDeclarationSort': true
      }
    ],
    'import/order': [
        'error',
        {
          'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'pathGroups': [
            {
              'pattern': '@/**',
              'group': 'internal'
            }
          ],
          'alphabetize': {
            'order': 'asc',
            'caseInsensitive': true,
          }
        }
    ],
    'yoda': ['error', 'never'],
  },
  'settings': {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': {
      'node': {
        'extensions': ['.js', '.jsx', '.ts', '.tsx']
      },
      'typescript': {
        'alwaysTryTypes': true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`

        // Choose from one of the 'project' configs below or omit to use <root>/tsconfig.json by default

        // use <root>/path/to/folder/tsconfig.json
        'project': '<root>/tsconfig.json',
      }
    },
    'import/internal-regex': '^@/'
  },
};
