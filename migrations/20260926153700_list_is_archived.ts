import { type Kysely, sql } from 'kysely';

// `unknown` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(database: Kysely<unknown>): Promise<void> {
  await database.schema
    .alterTable('List')
    .addColumn('isArchived', 'boolean', (column) => column.notNull().defaultTo(false))
    .execute();

  // Start fresh: archive existing lists; new lists still default to false.
  await sql`UPDATE "List" SET "isArchived" = true`.execute(database);
}

// `unknown` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(database: Kysely<unknown>): Promise<void> {
  await database.schema.alterTable('List').dropColumn('isArchived').execute();
}
