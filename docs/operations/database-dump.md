# Database dump and restore

## Create a dump from production

```bash
docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$REMOTE_DIR/db-$TIMESTAMP.sql"
```

## Restore a dump locally

Before restoring, clean or stop your local environment (`docker compose down` can be enough depending on your state).

After installing dependencies (`make install`), restore with:

```bash
docker compose exec -T postgres psql -U postgres -d caddie_app < /path/to/dump/file.sql
```
