import { type Kysely, sql } from 'kysely';

// `unknown` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(database: Kysely<unknown>): Promise<void> {
  // Case-insensitive uniqueness scoped to a single list (same name may exist on other lists).
  await sql`CREATE UNIQUE INDEX "Item_listId_name_key" ON "Item" ("listId", lower("name"));`.execute(database);
}

// `unknown` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(database: Kysely<unknown>): Promise<void> {
  await sql`DROP INDEX IF EXISTS "Item_listId_name_key";`.execute(database);
}
