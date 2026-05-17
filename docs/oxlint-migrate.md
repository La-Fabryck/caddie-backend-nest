# Oxlint migrate

Reference article: [Migrating from ESLint to Oxlint](https://medium.com/@chirag.dev18/migrating-from-eslint-to-oxlint-a-practical-guide-f9795083342d)

## Regenerate `.oxlintrc.json`

Canonical command for this repo (type-aware + nursery + full skip list):

```bash
npx --yes @oxlint/migrate eslint.config.mjs --type-aware --details --with-nursery
```

Run on the **host** (Node 24, `npm ci` at repo root). Requires `eslint.config.mjs` as the migrate source.

Example output (`--type-aware --details --with-nursery`):

```text
✨ .oxlintrc.json created with 288 rules.

   Skipped 16 rules:
     - 12 Not Implemented
       - unicorn/expiring-todo-comments
       - unicorn/import-style
       - unicorn/isolated-functions
       - unicorn/no-unnecessary-polyfills
       - unicorn/prefer-export-from
       - unicorn/prefer-simple-condition-first
       - unicorn/prefer-single-call
       - unicorn/prefer-switch
       - unicorn/prevent-abbreviations
       - unicorn/template-indent
       - @typescript-eslint/method-signature-style
       - require-atomic-updates
     - 4 Unsupported
       - no-dupe-args: Superseded by strict mode.
       - no-octal: Superseded by strict mode.
       - unicorn/no-for-loop: This rule suggests using `Array.prototype.entries` which is slow https://github.com/oxc-project/oxc/issues/11311, furthermore, `typescript/prefer-for-of` covers most cases.
       - unicorn/no-named-default: Implemented via `import/no-named-default`.

🚀 Next:
     npx oxlint .

⚠  Warnings (1):
   * ESLint import-sorting rules like `sort-imports` were not migrated because they conflict with Oxfmt's import sorting.
     * Use Oxfmt's `sortImports` formatter option instead. It is based on `eslint-plugin-perfectionist/sort-imports`, is disabled by default, and will need to be enabled.
     * https://oxc.rs/docs/guide/usage/formatter/sorting.html
```

## Manual additions (not emitted by migrate)

Re-apply after a fresh migrate if these are missing:

| Upstream gap                             | Our rule in `.oxlintrc.json`                                                                                |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `unicorn/no-for-loop` (unsupported)      | `typescript/prefer-for-of`: `error`                                                                         |
| `unicorn/no-named-default` (unsupported) | `import/no-named-default`: `error` (`import` plugin)                                                        |
| (not in ESLint config)                   | `node/*` rules + override for `node/no-process-env` on config boundaries — see `.oxlintrc.json` `overrides` |

## Lint / format scripts

- `npm run lint` → `oxlint .` then `oxfmt --check .` (requires `oxlint` + `oxlint-tsgolint` because `options.typeAware` is `true`)
- `npm run format` → `oxfmt --write .` then `oxlint --fix .`
- **Named import order** (`Insertable`, `Kysely`, … within one `import`): Oxfmt `sortImports` only sorts import _lines_. Use Oxlint `sort-imports` with `ignoreDeclarationSort: true` (fixed by `oxlint --fix` in `npm run format`). No `eslint-plugin-perfectionist` needed.
- `eslint.config.mjs` remains the **source** for `@oxlint/migrate`; primary CI/dev lint is Oxlint + Oxfmt.

## Formatting (Oxfmt)

Prettier and `eslint-plugin-prettier` / `eslint-plugin-perfectionist` were removed. Line width and indent live in [`.editorconfig`](../.editorconfig) (`max_line_length = 140`); Oxfmt-specific options in [`.oxfmtrc.json`](../.oxfmtrc.json) (`singleQuote`, `trailingComma: "all"`, `sortImports` with `@/` and `test/` internal patterns).

## Notes

- After editing `eslint.config.mjs`, re-run migrate and merge manual additions above.
- **`typescript/consistent-type-imports` is off** for Nest: with `emitDecoratorMetadata`, these need **value** imports (not `import type`): constructor-injected classes (`ConfigService`, `*Service`) and DTO classes on `@Body()` (otherwise `ValidationPipe` never runs). Services may still use `import type` for DTOs. [Github issue](https://github.com/oxc-project/oxc/issues/13609)
