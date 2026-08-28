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
- Use Zod as validator ? [Zod Integration](https://docs.nestjs.com/pipes#object-schema-validation) - Waiting [NestJS 12 supports native scheman](https://github.com/nestjs/nest/pull/16391)
- ~~Migrate to [Kysely](https://kysely.dev/)~~
- ~~Align Kysely query/error logs with the app logger~~ (Nest `Logger` via Kysely `log` callback; still pending pino)
- CQRS architecture
- Move Auth user from Fastify Request to [NestJS LocalStorage](https://docs.nestjs.com/recipes/async-local-storage

Later :

- Implement pino logger with [correlation ID](https://sagarvaghela.medium.com/nestjs-logging-pino-correlation-id-and-gcp-cloud-logging-90a7e6c13a8d)

## Unify parsers — TypeScript 7.1, keep Lefthook

Today the repo compiles TypeScript twice: **Nest CLI + SWC** (app) and **Vitest/Vite + unplugin-swc** (tests). Lint/format is already Oxc. Git hooks stay on Lefthook (named jobs, piped format→lint, typecheck ∥ knip). Vite+ staged is lint-staged: glob concurrency only, no Lefthook job graph — skip it.

TS 7.0 is CLI-only. Nest needs the **programmatic API** in **7.1**. Stay on `typescript@^6` until Nest CLI actually loads 7.1.

1. Watch Nest CLI for 7.1 (`getParsedCommandLineOfConfigFile` and friends — a bump alone may not be enough; the API is described as new).
2. When Nest supports it: `typescript@^7.1`, keep `builder` + `typeCheck: true` in `nest-cli.json`.
3. Switch the Nest builder from SWC back to `tsc` / `tsgo` if metadata and watch/debug still match. Delete `@swc/cli`, `@swc/core`, `.swcrc`.
4. Tests: drop `unplugin-swc` — either Vite 8 [Oxc `emitDecoratorMetadata`](https://vite.dev/guide/features#emitdecoratormetadata) (can spike this anytime) or the same TS 7.1 pipeline as the app.
5. Lefthook unchanged.
