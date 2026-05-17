# Caddie Backend (NestJS)

NestJS backend service for Caddie, with PostgreSQL in Docker for local development.

## Quick start

### Prerequisites

- Docker + Docker Compose
- Node.js >= 24 (see [`.node-version`](.node-version); fnm, asdf, etc.)
- Make

### Install and bootstrap

```bash
make install
```

This pulls images, runs `npm ci` on the host, and builds the e2e test image.

### Start dev (Postgres + app)

Use `POSTGRES_HOST=localhost` in [`.env`](.env) (see [`.env.sample`](.env.sample)).

```bash
make start
```

This starts Postgres in Docker, runs migrations, then `npm run start:dev` on the host. API listens on port `3001` (see `NEST_PORT` in `.env`). Ctrl+C stops Nest; Postgres keeps running (`make stop` stops the container; `make down` removes it).

Or step by step:

```bash
make start-deps          # Postgres only
npm run db:migrate:latest
npm run start:dev
```

For migration details, see [`docs/migrations.md`](docs/migrations.md).

Optional:

```bash
node -v
npm run lint
```

## E2E tests

E2e runs in an Alpine test container (see [`docker/app/e2e/`](docker/app/e2e/)):

```bash
make ci-e2e
```

## Additional guides

- Database dump and restore: [`docs/operations/database-dump.md`](docs/operations/database-dump.md)
- Docker cleanup and dev reset: [`docs/operations/docker-clean-reset.md`](docs/operations/docker-clean-reset.md)
- Production startup simulation: [`docs/operations/production-simulation.md`](docs/operations/production-simulation.md)
- Dependency and Fastify compatibility: [`docs/development/dependencies.md`](docs/development/dependencies.md)
- Testing and debugger usage: [`docs/development/testing.md`](docs/development/testing.md)
- Authentication tokens (access + refresh cookies): [`docs/authentication-tokens.md`](docs/authentication-tokens.md)
- Oxlint migration notes: [`docs/oxlint-migrate.md`](docs/oxlint-migrate.md)
