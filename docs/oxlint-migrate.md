# Oxlint

Lint and format: `npm run lint` / `npm run format` (Oxfmt + Oxlint). Type-aware rules need `oxlint-tsgolint` (`options.typeAware` in [`oxlint.config.ts`](../oxlint.config.ts)).

## Git hooks

Pre-commit ([Lefthook](https://github.com/evilmartians/lefthook)) ([`lefthook.yml`](../lefthook.yml)):

- **format-and-lint** (piped, sequential) — **oxfmt** on staged `*.{js,ts,mjs,cjs,mts,json,md,yml,yaml}`, then **oxlint** on staged `*.{js,ts,mjs,cjs,mts}` (`stage_fixed` re-stages fixes)
- **`typecheck`** — `typecheck:src` and `typecheck:test` in **parallel** (lefthook group), also in **parallel** with format-and-lint
- **`knip`** — unused files/exports/dependencies (`npm run check:knip`; full repo, fails on issues)

Atomic scripts in `package.json`: `check:knip` / `check:oxfmt` / `check:oxlint` (read-only), `fix:oxfmt` / `fix:oxlint` (write + `--fix`). Top-level `npm run lint` / `npm run format` run the oxfmt/oxlint check/fix pair on `.`.

Full-repo checks stay on `npm run lint` (Makefile `ncu-doctor-test`, `sync-fastify`, CI, etc.). Hooks install via lefthook’s postinstall on `npm ci` / `npm install` (`allowScripts.lefthook`: `true`).

## Configuration

- [`oxlint.config.ts`](../oxlint.config.ts) — all rules and overrides (edit here)
- [`oxfmt.config.ts`](../oxfmt.config.ts) — formatting and import line order
- [`.editorconfig`](../.editorconfig) — indent, line width (`max_line_length = 140`)

The app is ESM (`package.json` `"type": "module"`), so these configs are plain `.ts` and Oxlint/Oxfmt auto-discover them (no `-c` in npm scripts).

## TODO: category bundles

Planned in [`oxlint.config.ts`](../oxlint.config.ts) (`categories` block): enable **`correctness`** + **`suspicious`** + **`perf`** when ready to triage; skip **`pedantic`** unless you want extra-strict linting with more false positives.

## Rules not enabled (see comments in `oxlint.config.ts`)

| Topic                                | Notes                                                                                                                                                                |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `typescript/consistent-type-imports` | **off** for Nest: `emitDecoratorMetadata` needs value imports for injected services and `@Body()` DTOs. [oxc#13609](https://github.com/oxc-project/oxc/issues/13609) |
| Several `unicorn/*` rules            | Not implemented in Oxlint yet — listed as commented entries in config                                                                                                |
| `unicorn/no-for-loop`                | Use `typescript/prefer-for-of` instead                                                                                                                               |
| `unicorn/no-named-default`           | Use `import/no-named-default` instead                                                                                                                                |

## Import sorting

- **Lines**: Oxfmt `sortImports` in [`oxfmt.config.ts`](../oxfmt.config.ts)
- **Names inside `{ }`**: Oxlint `sort-imports` with `ignoreDeclarationSort: true` (`fix:oxlint` / `npm run format`)
