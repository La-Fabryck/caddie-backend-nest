# Oxlint

Lint and format: `npm run lint` / `npm run format` (Oxfmt + Oxlint). Type-aware rules need `oxlint-tsgolint` (`options.typeAware` in [`oxlint.config.ts`](../oxlint.config.ts)).

## Git hooks

Pre-commit (Husky → lint-staged) runs on **staged files only**:

- `*.{js,ts,mjs,cjs}` — `oxfmt --write`, then `oxlint --fix`
- `*.{json,md,yml,yaml}` — `oxfmt --write --no-error-on-unmatched-pattern` (Oxfmt ignores `package-lock.json`; the flag avoids a hook failure when only the lockfile is staged)

Full-repo checks stay on `npm run lint` (Makefile `ncu-doctor-test`, `sync-fastify`, CI, etc.). Hooks install via `npm ci` / `npm run prepare` (`prepare`: `husky`).

## Configuration

- [`oxlint.config.ts`](../oxlint.config.ts) — all rules and overrides (edit here)
- [`oxfmt.config.ts`](../oxfmt.config.ts) — formatting and import line order
- [`.editorconfig`](../.editorconfig) — indent, line width (`max_line_length = 140`)

## TODO: category bundles

Planned in [`oxlint.config.ts`](../oxlint.config.ts) (`categories` block): enable **`correctness`** + **`suspicious`** + **`perf`** after ESLint is removed; skip **`pedantic`** unless you want extra-strict linting with more false positives.

## Rules not enabled (see comments in `oxlint.config.ts`)

| Topic                                | Notes                                                                                                                                                                |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `typescript/consistent-type-imports` | **off** for Nest: `emitDecoratorMetadata` needs value imports for injected services and `@Body()` DTOs. [oxc#13609](https://github.com/oxc-project/oxc/issues/13609) |
| Several `unicorn/*` rules            | Not implemented in Oxlint yet — listed as commented entries in config                                                                                                |
| `unicorn/no-for-loop`                | Use `typescript/prefer-for-of` instead                                                                                                                               |
| `unicorn/no-named-default`           | Use `import/no-named-default` instead                                                                                                                                |

## Import sorting

- **Lines**: Oxfmt `sortImports` in `oxfmt.config.ts`
- **Names inside `{ }`**: Oxlint `sort-imports` with `ignoreDeclarationSort: true` (`oxlint --fix` in `npm run format`)
