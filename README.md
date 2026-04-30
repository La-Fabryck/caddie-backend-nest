# Caddie Backend (NestJS)

NestJS backend service for Caddie, running in Docker with Fastify and PostgreSQL.

## Quick start

### Prerequisites

- Docker + Docker Compose
- Make

### Install and bootstrap

Use the Make target that wraps the setup steps:

```bash
make install
```

This includes:
- creating `caddie_network` (if missing)
- pulling Docker images
- building the backend image
- running `npm ci` in the backend container

### Run migrations

```bash
docker compose run --rm backend npm run db:migrate:latest
```

For migration details, see [`docs/migrations.md`](docs/migrations.md).

### Start the app

```bash
docker compose up
```

Optional runtime check:

```bash
docker compose exec backend node -v
```

## Additional guides

- Database dump and restore: [`docs/operations/database-dump.md`](docs/operations/database-dump.md)
- Docker cleanup and dev reset: [`docs/operations/docker-clean-reset.md`](docs/operations/docker-clean-reset.md)
- Production startup simulation: [`docs/operations/production-simulation.md`](docs/operations/production-simulation.md)
- Dependency and Fastify compatibility: [`docs/development/dependencies.md`](docs/development/dependencies.md)
- Testing and debugger usage: [`docs/development/testing.md`](docs/development/testing.md)
