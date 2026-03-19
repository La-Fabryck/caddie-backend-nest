/* eslint-disable unicorn/filename-case -- migration names are fixed (Kysely keys) */
import { type Kysely, sql } from 'kysely';

/**
 * Normalizes id and temporal columns across List, Item, Subscriber, User:
 * - List.id/text -> uuid; Item.listId, Subscriber.listId -> uuid
 * - User.id, Item.id, Subscriber.id/text -> uuid; Subscriber.userId -> uuid
 * - List.createdAt, List.updatedAt timestamp -> timestamptz(3); defaults -> now()
 * - id defaults: gen_random_uuid() on List, User, Item, Subscriber
 */
export async function up(database: Kysely<unknown>): Promise<void> {
  await database.schema.alterTable('Item').dropConstraint('Item_listId_fkey').ifExists().execute();
  await database.schema.alterTable('Subscriber').dropConstraint('Subscriber_listId_fkey').ifExists().execute();
  await database.schema.alterTable('Subscriber').dropConstraint('Subscriber_userId_fkey').ifExists().execute();

  await sql`ALTER TABLE "List" ALTER COLUMN "id" TYPE uuid USING "id"::uuid;`.execute(database);
  await sql`ALTER TABLE "Item" ALTER COLUMN "listId" TYPE uuid USING "listId"::uuid;`.execute(database);
  await sql`ALTER TABLE "Subscriber" ALTER COLUMN "listId" TYPE uuid USING "listId"::uuid;`.execute(database);

  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'List_pkey'
          AND conrelid = '"List"'::regclass
      ) THEN
        ALTER TABLE "List" ADD CONSTRAINT "List_pkey" PRIMARY KEY ("id");
      END IF;
    END $$;
  `.execute(database);

  await sql`
    ALTER TABLE "List"
    ALTER COLUMN "createdAt" TYPE timestamptz(3) USING ("createdAt" AT TIME ZONE 'UTC'),
    ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING ("updatedAt" AT TIME ZONE 'UTC');
  `.execute(database);

  await database.schema
    .alterTable('List')
    .alterColumn('id', (ac) => ac.setDefault(sql`gen_random_uuid()`))
    .alterColumn('createdAt', (ac) => ac.setDefault(sql`now()`))
    .alterColumn('updatedAt', (ac) => ac.setDefault(sql`now()`))
    .execute();

  await sql`ALTER TABLE "User" ALTER COLUMN "id" TYPE uuid USING "id"::uuid;`.execute(database);
  await sql`ALTER TABLE "Subscriber" ALTER COLUMN "userId" TYPE uuid USING "userId"::uuid;`.execute(database);
  await sql`ALTER TABLE "Item" ALTER COLUMN "id" TYPE uuid USING "id"::uuid;`.execute(database);
  await sql`ALTER TABLE "Subscriber" ALTER COLUMN "id" TYPE uuid USING "id"::uuid;`.execute(database);

  await database.schema
    .alterTable('User')
    .alterColumn('id', (ac) => ac.setDefault(sql`gen_random_uuid()`))
    .execute();
  await database.schema
    .alterTable('Item')
    .alterColumn('id', (ac) => ac.setDefault(sql`gen_random_uuid()`))
    .execute();
  await database.schema
    .alterTable('Subscriber')
    .alterColumn('id', (ac) => ac.setDefault(sql`gen_random_uuid()`))
    .execute();

  await database.schema
    .alterTable('Item')
    .addForeignKeyConstraint('Item_listId_fkey', ['listId'], 'List', ['id'], (callback) =>
      callback.onUpdate('cascade').onDelete('restrict'),
    )
    .execute();

  await database.schema
    .alterTable('Subscriber')
    .addForeignKeyConstraint('Subscriber_listId_fkey', ['listId'], 'List', ['id'], (callback) =>
      callback.onUpdate('cascade').onDelete('restrict'),
    )
    .execute();

  await database.schema
    .alterTable('Subscriber')
    .addForeignKeyConstraint('Subscriber_userId_fkey', ['userId'], 'User', ['id'], (callback) =>
      callback.onUpdate('cascade').onDelete('restrict'),
    )
    .execute();
}

export async function down(database: Kysely<unknown>): Promise<void> {
  await database.schema.alterTable('Item').dropConstraint('Item_listId_fkey').ifExists().execute();
  await database.schema.alterTable('Subscriber').dropConstraint('Subscriber_listId_fkey').ifExists().execute();
  await database.schema.alterTable('Subscriber').dropConstraint('Subscriber_userId_fkey').ifExists().execute();

  await database.schema
    .alterTable('List')
    .alterColumn('id', (ac) => ac.dropDefault())
    .alterColumn('createdAt', (ac) => ac.dropDefault())
    .alterColumn('updatedAt', (ac) => ac.dropDefault())
    .execute();

  await database.schema
    .alterTable('User')
    .alterColumn('id', (ac) => ac.dropDefault())
    .execute();
  await database.schema
    .alterTable('Item')
    .alterColumn('id', (ac) => ac.dropDefault())
    .execute();
  await database.schema
    .alterTable('Subscriber')
    .alterColumn('id', (ac) => ac.dropDefault())
    .execute();

  await sql`
    ALTER TABLE "List"
    ALTER COLUMN "createdAt" TYPE timestamp(3) USING ("createdAt" AT TIME ZONE 'UTC'),
    ALTER COLUMN "updatedAt" TYPE timestamp(3) USING ("updatedAt" AT TIME ZONE 'UTC');
  `.execute(database);

  await sql`ALTER TABLE "Subscriber" ALTER COLUMN "listId" TYPE text USING "listId"::text;`.execute(database);
  await sql`ALTER TABLE "Item" ALTER COLUMN "listId" TYPE text USING "listId"::text;`.execute(database);
  await sql`ALTER TABLE "List" ALTER COLUMN "id" TYPE text USING "id"::text;`.execute(database);

  await sql`ALTER TABLE "Subscriber" ALTER COLUMN "id" TYPE text USING "id"::text;`.execute(database);
  await sql`ALTER TABLE "Item" ALTER COLUMN "id" TYPE text USING "id"::text;`.execute(database);
  await sql`ALTER TABLE "Subscriber" ALTER COLUMN "userId" TYPE text USING "userId"::text;`.execute(database);
  await sql`ALTER TABLE "User" ALTER COLUMN "id" TYPE text USING "id"::text;`.execute(database);

  await database.schema
    .alterTable('User')
    .alterColumn('id', (ac) => ac.setDefault(sql`gen_random_uuid()`))
    .execute();
  await database.schema
    .alterTable('Item')
    .alterColumn('id', (ac) => ac.setDefault(sql`gen_random_uuid()`))
    .execute();
  await database.schema
    .alterTable('Subscriber')
    .alterColumn('id', (ac) => ac.setDefault(sql`gen_random_uuid()`))
    .execute();

  await database.schema
    .alterTable('Item')
    .addForeignKeyConstraint('Item_listId_fkey', ['listId'], 'List', ['id'], (callback) =>
      callback.onUpdate('cascade').onDelete('restrict'),
    )
    .execute();

  await database.schema
    .alterTable('Subscriber')
    .addForeignKeyConstraint('Subscriber_listId_fkey', ['listId'], 'List', ['id'], (callback) =>
      callback.onUpdate('cascade').onDelete('restrict'),
    )
    .execute();

  await database.schema
    .alterTable('Subscriber')
    .addForeignKeyConstraint('Subscriber_userId_fkey', ['userId'], 'User', ['id'], (callback) =>
      callback.onUpdate('cascade').onDelete('restrict'),
    )
    .execute();
}
