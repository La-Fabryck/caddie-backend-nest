# Kysely migrations

Migrations run in alphanumeric order. They match the schema produced by the Prisma migrations so you can switch to Kysely for migrations without changing the database shape.

## Run migrations

Migrations are run via [kysely-ctl](https://github.com/kysely-org/kysely-ctl). From the project root with `DATABASE_URL` set (e.g. in `.env`):

```bash
npm run db:migrate:latest
```

This runs `kysely migrate latest`. To create a new migration:

```bash
npm run db:migrate:make -- <migration_name>
```

Example: `npm run db:migrate:make -- add_notes_column`

