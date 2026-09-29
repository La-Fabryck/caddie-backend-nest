Tech :

Later'ish :

- Small cache for users
- CQRS architecture
- Move Auth user from Fastify Request to [NestJS LocalStorage](https://docs.nestjs.com/recipes/async-local-storage)

Later :

- Implement pino logger with [correlation ID](https://sagarvaghela.medium.com/nestjs-logging-pino-correlation-id-and-gcp-cloud-logging-90a7e6c13a8d)

## 1. Drop SWC after TS 7.1

Match the Nest 12 scaffold (`nodenext`, `builder: "tsc"`, `node dist/main`) but keep aliases as Node [subpath imports](https://nodejs.org/api/packages.html#subpath-imports) (`#/…`, not `@/`). No SWC, no `tsconfig-paths`, no `tsc-alias`. **Vitest stays.**

**Wait for Nest CLI to load TypeScript 7.1** (`tsgo`) so watch/typecheck stay fast. Until then keep `builder: "swc"` (current emit is the speed we want). Do not switch to JS `tsc` just to delete SWC.

When Nest supports 7.1:

1. `typescript@^7.1`. `module` / `moduleResolution`: `nodenext`. Relative imports get `.js` (`from './foo.js'` → `foo.ts`). Turn `unicorn/require-module-specifiers` **on**.
2. Replace `@/` with `#/` (or `#src/`). `package.json` `"imports"` → `./dist/…`; `tsconfig` `paths` / `types` condition → `./src/…` so typecheck does not need `dist/` first.
3. `test/` can stay a Vitest-only alias (never emitted). Point Vitest at tsconfig like the scaffold (`vite-tsconfig-paths`); drop `unplugin-swc`.
4. `nest-cli.json`: default `tsc` / `tsgo` (delete `builder: "swc"`). Delete `@swc/cli`, `@swc/core`, `unplugin-swc`, `.swcrc`. Lefthook unchanged.

Do not use `tsconfig-paths` at runtime (CJS hook, broken for ESM).

## 2. Drop Vitest → `node:test` (after §1)

Separate follow-up. Do not mix with the SWC migration.

1. Emit tests with tsgo (decorators need a real compile; Node strip-types alone cannot run Nest). Resolve `#/` / `#test/` from emit or `package.json` `"imports"`.
2. Rewrite Vitest `expect` to `node:assert` / `node:assert/strict`. Point scripts at `node --test`. Coverage via Node’s test coverage flags.
3. Delete `vitest`, `@vitest/coverage-v8`, `vitest.config*.ts`.
