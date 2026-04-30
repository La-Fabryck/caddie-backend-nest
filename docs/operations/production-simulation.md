# Simulate production startup

From a clean slate:

## 1) Ensure external network exists

```bash
docker network create caddie_network
```

## 2) Configure environment variables

Ensure `.env` includes:

```bash
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=caddie_app
```

## 3) Build and start the production stack

```bash
./docker/app/prod/build.sh
```

The script builds, starts in detached mode, then runs migrations.

Without the script (for manual runs), use:

```bash
docker compose -f docker/app/prod/compose.yml up --build
docker compose -f docker/app/prod/compose.yml run --rm backend npm run db:migrate:kysely
```

## Notes

- Backend startup runs `npm run start:prod`.
- Migrations are not executed automatically by container startup.
- Postgres data persists in the `pgcaddie` volume.
- To fully restart from scratch, run cleanup commands in [`docker-clean-reset.md`](./docker-clean-reset.md).
