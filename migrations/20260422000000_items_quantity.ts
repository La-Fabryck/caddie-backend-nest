/* eslint-disable unicorn/filename-case -- migration names are fixed (Kysely keys) */
import { type Kysely, sql } from 'kysely';

const DEFAULT_ITEM_QUANTITY = 1;

// `unknown` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(database: Kysely<unknown>): Promise<void> {
  await database.schema
    .alterTable('Item')
    .addColumn('quantity', 'integer', (column) => column.defaultTo(DEFAULT_ITEM_QUANTITY))
    .execute();

  await sql`UPDATE "Item" SET "quantity" = ${DEFAULT_ITEM_QUANTITY} WHERE "quantity" IS NULL;`.execute(database);

  await database.schema
    .alterTable('Item')
    .alterColumn('quantity', (column) => column.setNotNull())
    .execute();
}

// `unknown` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(database: Kysely<unknown>): Promise<void> {
  await database.schema.alterTable('Item').dropColumn('quantity').execute();
}
