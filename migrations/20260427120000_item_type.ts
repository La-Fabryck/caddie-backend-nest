/* eslint-disable unicorn/filename-case -- migration names are fixed (Kysely keys) */
import { type Kysely, sql } from 'kysely';

// `unknown` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(database: Kysely<unknown>): Promise<void> {
  await database.schema
    .createTable('ItemType')
    .addColumn('id', 'uuid', (column) =>
      column
        .primaryKey()
        .notNull()
        .defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('label', 'varchar(255)', (column) => column.notNull())
    .addColumn('userId', 'uuid', (column) => column.notNull().references('User.id').onDelete('cascade').onUpdate('cascade'))
    .execute();

  await database.schema
    .alterTable('Item')
    .addColumn('itemTypeId', 'uuid', (column) => column.references('ItemType.id').onDelete('set null').onUpdate('cascade'))
    .execute();

  await database.schema.createIndex('Item_itemTypeId_idx').on('Item').column('itemTypeId').execute();
  await database.schema.createIndex('ItemType_userId_idx').on('ItemType').column('userId').execute();
  await sql`CREATE UNIQUE INDEX "ItemType_userId_label_key" ON "ItemType" ("userId", lower("label"));`.execute(database);
}

// `unknown` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(database: Kysely<unknown>): Promise<void> {
  await sql`DROP INDEX IF EXISTS "ItemType_userId_label_key";`.execute(database);
  await database.schema.dropIndex('ItemType_userId_idx').ifExists().on('ItemType').execute();
  await database.schema.dropIndex('Item_itemTypeId_idx').ifExists().on('Item').execute();
  await database.schema.alterTable('Item').dropColumn('itemTypeId').execute();
  await database.schema.dropTable('ItemType').execute();
}
