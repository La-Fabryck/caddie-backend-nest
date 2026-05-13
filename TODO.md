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
- CQRS architecture
- Move Auth user from Fastify Request to [NestJS LocalStorage](https://docs.nestjs.com/recipes/async-local-storage

Later :

- Implement pino logger with [correlation ID](https://sagarvaghela.medium.com/nestjs-logging-pino-correlation-id-and-gcp-cloud-logging-90a7e6c13a8d) 

