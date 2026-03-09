/* eslint-disable unicorn/filename-case -- migration names are fixed (Kysely keys) */
import { type Kysely, sql } from 'kysely';

/**
 * Adds DEFAULT gen_random_uuid() to id columns (PostgreSQL 13+).
 * Matches prisma/migrations/20250221000000_add_uuid_defaults/migration.sql.
 */
export async function up(database: Kysely<unknown>): Promise<void> {
  await database.schema
    .alterTable('User')
    .alterColumn('id', (ac) => ac.setDefault(sql`gen_random_uuid()`))
    .execute();
  await database.schema
    .alterTable('List')
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
}

export async function down(database: Kysely<unknown>): Promise<void> {
  await database.schema
    .alterTable('User')
    .alterColumn('id', (ac) => ac.dropDefault())
    .execute();
  await database.schema
    .alterTable('List')
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
}
