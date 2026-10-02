import { type Kysely, sql } from 'kysely';

// `unknown` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(database: Kysely<unknown>): Promise<void> {
  await database.schema
    .createTable('ShareLink')
    .addColumn('id', 'uuid', (column) =>
      column
        .primaryKey()
        .notNull()
        .defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('listId', 'uuid', (column) => column.notNull().references('List.id').onDelete('cascade').onUpdate('cascade'))
    .addColumn('token', 'text', (column) => column.notNull().unique())
    .addColumn('createdByUserId', 'uuid', (column) => column.notNull().references('User.id').onDelete('cascade').onUpdate('cascade'))
    .addColumn('createdAt', 'timestamptz', (column) => column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('expiresAt', 'timestamptz', (column) => column.notNull())
    .execute();

  await database.schema.createIndex('ShareLink_listId_idx').on('ShareLink').column('listId').execute();
  await database.schema.createIndex('ShareLink_expiresAt_idx').on('ShareLink').column('expiresAt').execute();

  // Deduplicate before enforcing uniqueness (legacy inserts could create duplicates).
  await sql`
    DELETE FROM "Subscriber" a
    USING "Subscriber" b
    WHERE a."listId" = b."listId"
      AND a."userId" = b."userId"
      AND a.ctid < b.ctid
  `.execute(database);

  await database.schema.createIndex('Subscriber_listId_userId_key').on('Subscriber').columns(['listId', 'userId']).unique().execute();
}

// `unknown` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(database: Kysely<unknown>): Promise<void> {
  await database.schema.dropIndex('Subscriber_listId_userId_key').ifExists().on('Subscriber').execute();
  await database.schema.dropIndex('ShareLink_expiresAt_idx').ifExists().on('ShareLink').execute();
  await database.schema.dropIndex('ShareLink_listId_idx').ifExists().on('ShareLink').execute();
  await database.schema.dropTable('ShareLink').ifExists().execute();
}
