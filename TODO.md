Tech :

HTTP API errors (validation vs business rules):

- **400 Bad Request** — Simple validation: malformed payload, missing fields, wrong types, format checks (email shape, etc.).
- **422 Unprocessable Entity** — Business rules: syntactically valid request that conflicts with application state or policy (e.g. email already registered, unique name per list violated).

Mandatory :

- ~~Set up [Nest config](https://docs.nestjs.com/techniques/configuration) correctly, rework env variables and prefix~~
- [Helmet](https://docs.nestjs.com/security/helmet) & accept only application/json

Later'ish :

- **Config / prod env** — In `ConfigModule.forRoot`, consider `skipEnvFile` when `NODE_ENV === 'production'` (or a dedicated flag such as `LOAD_DOTENV`) so production relies only on injected `process.env` (e.g. Docker Compose `env_file` / platform secrets) and does not look for `.env` on disk. Today the prod image does not ship `.env`, and compose injects vars; this would make that contract explicit in code.
- Validate unique item name per shopping list
- ~~JWT Refresh~~
- ~~Integration Tests~~
- Small cache for users
- ~~Use Zod as validator (Nest 12 `StandardSchemaValidationPipe`)~~
- ~~Migrate to [Kysely](https://kysely.dev/)~~
- ~~Align Kysely query/error logs with the app logger~~ (Nest `Logger` via Kysely `log` callback; still pending pino)
- CQRS architecture
- Move Auth user from Fastify Request to [NestJS LocalStorage](https://docs.nestjs.com/recipes/async-local-storage

Later :

- Implement pino logger with [correlation ID](https://sagarvaghela.medium.com/nestjs-logging-pino-correlation-id-and-gcp-cloud-logging-90a7e6c13a8d)

## Unify parsers — drop SWC via `#/` + `.js` after TS 7.1

Match the Nest 12 scaffold (`nodenext`, `builder: "tsc"`, `node dist/main`) but keep aliases as Node [subpath imports](https://nodejs.org/api/packages.html#subpath-imports) (`#/…`, not `@/`). No SWC, no `tsconfig-paths`, no `tsc-alias`.

**Wait for Nest CLI to load TypeScript 7.1** (`tsgo`) so watch/typecheck stay fast. Until then keep `builder: "swc"` (current emit is the speed we want). Do not switch to JS `tsc` just to delete SWC.

When Nest supports 7.1:

1. `typescript@^7.1`. `module` / `moduleResolution`: `nodenext`. Relative imports get `.js` (`from './foo.js'` → `foo.ts`). Turn `unicorn/require-module-specifiers` **on**.
2. Replace `@/` with `#/` (or `#src/`). `package.json` `"imports"` → `./dist/…`; `tsconfig` `paths` / `types` condition → `./src/…` so typecheck does not need `dist/` first.
3. `test/` can stay a Vitest-only alias (never emitted). Point Vitest at tsconfig like the scaffold (`vite-tsconfig-paths`); drop `unplugin-swc`.
4. `nest-cli.json`: default `tsc` / `tsgo` (delete `builder: "swc"`). Delete `@swc/cli`, `@swc/core`, `unplugin-swc`, `.swcrc`. Lefthook unchanged.

Do not use `tsconfig-paths` at runtime (CJS hook, broken for ESM).
