# Kysely migrations

Migrations run in alphanumeric order. They match the schema produced by the Prisma migrations so you can switch to Kysely for migrations without changing the database shape.

## Run migrations

Migrations are run via [kysely-ctl](https://github.com/kysely-org/kysely-ctl). From the project root with `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` set (e.g. in `.env`):

```bash
npm run db:migrate:latest
```

This runs `kysely migrate latest`. To create a new migration:

```bash
npm run db:migrate:make -- <migration_name>
```

Example: `npm run db:migrate:make -- add_notes_column`

## Generate types

After migrations, introspect the database into [`src/database/database-raw.d.ts`](../src/database/database-raw.d.ts):

```bash
npm run db:codegen
```

That file is the raw kysely-codegen snapshot. App code uses [`src/database/database-types.d.ts`](../src/database/database-types.d.ts), which wraps defaults in Kysely `Generated` and uses `Date` instead of codegen’s `Timestamp`. Copy new tables or columns from the raw file into `database-types.d.ts`; do not point codegen at the hand-maintained file.
