# Database dump and restore

## Create a dump from production

```bash
docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$REMOTE_DIR/db-$TIMESTAMP.sql"
```

## Restore a dump locally

`docker compose down` does not wipe data: Postgres keeps it in the `pgcaddie` volume. Restoring over an existing `caddie_app` fails with `relation "…" already exists`.

Drop and recreate the database first (connect to `postgres`, not `caddie_app`). `WITH (FORCE)` disconnects anything still using it, including a running API:

```bash
docker compose exec -T postgres psql -U postgres -d postgres -c 'DROP DATABASE IF EXISTS caddie_app WITH (FORCE);'
docker compose exec -T postgres psql -U postgres -d postgres -c 'CREATE DATABASE caddie_app OWNER postgres;'
```

Then restore. The shell redirect reads the dump on the host:

```bash
docker compose exec -T postgres psql -U postgres -d caddie_app < /path/to/dump/file.sql
```
