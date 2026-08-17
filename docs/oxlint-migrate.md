# Oxlint

Lint and format: `npm run lint` / `npm run format` (Oxfmt + Oxlint). Type-aware rules need `oxlint-tsgolint` (`options.typeAware` in [`oxlint.config.mts`](../oxlint.config.mts)).

## Git hooks

Pre-commit ([Lefthook](https://github.com/evilmartians/lefthook)) ([`lefthook.yml`](../lefthook.yml)):

- **format-and-lint** (piped, sequential) — **oxfmt** on staged `*.{js,ts,mjs,cjs,mts,json,md,yml,yaml}`, then **oxlint** on staged `*.{js,ts,mjs,cjs,mts}` (`stage_fixed` re-stages fixes)
- **`typecheck`** — `typecheck:src` and `typecheck:test` in **parallel** (lefthook group), also in **parallel** with format-and-lint
- **`knip`** — unused files/exports/dependencies (`npm run knip`; full repo, fails on issues)

Atomic scripts in `package.json`: `check:oxfmt` / `check:oxlint` (read-only), `fix:oxfmt` / `fix:oxlint` (write + `--fix`). Top-level `npm run lint` / `npm run format` run the check/fix pair on `.`.

Full-repo checks stay on `npm run lint` (Makefile `ncu-doctor-test`, `sync-fastify`, CI, etc.). Hooks install via lefthook’s postinstall on `npm ci` / `npm install` (`allowScripts.lefthook`: `true`).

## Configuration

- [`oxlint.config.mts`](../oxlint.config.mts) — all rules and overrides (edit here)
- [`oxfmt.config.mts`](../oxfmt.config.mts) — formatting and import line order (`.mts` avoids `package.json` `"type": "module"` while Nest stays CJS)
- [`.editorconfig`](../.editorconfig) — indent, line width (`max_line_length = 140`)

## OXC configs, Node, and future Nest ESM

**Why `.mts` today**

With a **CommonJS** `package.json` (no `"type": "module"`), Node can emit `MODULE_TYPELESS_PACKAGE_JSON` when it loads TypeScript configs named `*.config.ts` that use ESM syntax (`import` / `export`). That warning is about **how Node classifies the config file**, not about Nest’s runtime module system.

Using **`oxlint.config.mts`** and **`oxfmt.config.mts`** marks those files as **ES modules** to Node, so the warning goes away **without** turning the whole Nest app into ESM before Nest officially supports it.

**Why `-c oxlint.config.mts`**

Oxlint’s **auto-discovery** is built around `oxlint.config.ts`, not `oxlint.config.mts`. Until upstream discovers `.mts` by default, pass **`-c oxlint.config.mts`** in `check:oxlint` / `fix:oxlint` (see `package.json`). Oxfmt gets **`-c oxfmt.config.mts`** in `check:oxfmt` / `fix:oxfmt`.

**After Nest supports first-class ESM**

When the project can adopt **`"type": "module"`** (or whatever Nest recommends for ESM), you will **often no longer need `.mts`** just to silence that Node warning—you can try **`oxlint.config.ts`** / **`oxfmt.config.ts`** again.

The **`-c` flag** is separate: if you rename back to **`oxlint.config.ts`** and Oxlint auto-loads it, you can **drop `-c`** from scripts. If you keep **`oxlint.config.mts`**, you may still need **`-c`** until Oxlint adds default discovery for that filename.

| Concern                                      | Nest CJS today                          | Nest ESM later (typical)                                |
| -------------------------------------------- | --------------------------------------- | ------------------------------------------------------- |
| `MODULE_TYPELESS_PACKAGE_JSON` on TS configs | Avoid with `.mts` or accept the warning | Often fine with `oxlint.config.ts` + `"type": "module"` |
| `-c oxlint.config.mts`                       | Needed (no auto-discovery for `.mts`)   | Optional if you switch to `oxlint.config.ts`            |

## TODO: category bundles

Planned in [`oxlint.config.mts`](../oxlint.config.mts) (`categories` block): enable **`correctness`** + **`suspicious`** + **`perf`** when ready to triage; skip **`pedantic`** unless you want extra-strict linting with more false positives.

## Rules not enabled (see comments in `oxlint.config.mts`)

| Topic                                | Notes                                                                                                                                                                |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `typescript/consistent-type-imports` | **off** for Nest: `emitDecoratorMetadata` needs value imports for injected services and `@Body()` DTOs. [oxc#13609](https://github.com/oxc-project/oxc/issues/13609) |
| Several `unicorn/*` rules            | Not implemented in Oxlint yet — listed as commented entries in config                                                                                                |
| `unicorn/no-for-loop`                | Use `typescript/prefer-for-of` instead                                                                                                                               |
| `unicorn/no-named-default`           | Use `import/no-named-default` instead                                                                                                                                |

## Import sorting

- **Lines**: Oxfmt `sortImports` in `oxfmt.config.mts`
- **Names inside `{ }`**: Oxlint `sort-imports` with `ignoreDeclarationSort: true` (`fix:oxlint` / `npm run format`)
