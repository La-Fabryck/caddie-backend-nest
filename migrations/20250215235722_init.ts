/* eslint-disable unicorn/filename-case -- migration names are fixed (Kysely keys) */
import { type Kysely, sql } from 'kysely';

/**
 * Re-creates the schema from Prisma's initial migration (20250215235722_init).
 * Use this when starting fresh with Kysely; on existing DBs this will be skipped
 * if the migration was already applied via Prisma.
 */
export async function up(database: Kysely<unknown>): Promise<void> {
  await database.schema
    .createTable('User')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey().notNull())
    .addColumn('email', 'varchar(255)', (col) => col.unique().notNull())
    .addColumn('name', 'varchar(50)', (col) => col.notNull())
    .addColumn('password', 'varchar(255)', (col) => col.notNull())
    .execute();

  await database.schema
    .createTable('List')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey().notNull())
    .addColumn('title', 'varchar(50)', (col) => col.notNull())
    .addColumn('createdAt', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'timestamp', (col) => col.notNull())
    .execute();

  await database.schema
    .createTable('Item')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey().notNull())
    .addColumn('listId', 'text', (col) => col.notNull().references('List.id').onDelete('restrict').onUpdate('cascade'))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('isInCart', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute();

  await database.schema
    .createTable('Subscriber')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey().notNull())
    .addColumn('listId', 'text', (col) => col.notNull().references('List.id').onDelete('restrict').onUpdate('cascade'))
    .addColumn('userId', 'text', (col) => col.notNull().references('User.id').onDelete('restrict').onUpdate('cascade'))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .execute();

  await database.schema.createIndex('User_email_key').ifNotExists().on('User').column('email').unique().execute();
}

export async function down(database: Kysely<unknown>): Promise<void> {
  await database.schema.dropIndex('User_email_key').ifExists().on('User').execute();
  await database.schema.dropTable('Subscriber').ifExists().execute();
  await database.schema.dropTable('Item').ifExists().execute();
  await database.schema.dropTable('List').ifExists().execute();
  await database.schema.dropTable('User').ifExists().execute();
}
