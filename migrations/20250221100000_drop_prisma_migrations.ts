/* eslint-disable unicorn/filename-case -- migration names are fixed (Kysely keys) */
import type { Kysely } from 'kysely';

/**
 * Drops the Prisma migration tracking table.
 * Run this after switching to Kysely migrations so Prisma no longer thinks it owns migration state.
 * Safe if the table doesn't exist (e.g. fresh DB).
 */
export async function up(database: Kysely<unknown>): Promise<void> {
  await database.schema.dropTable('_prisma_migrations').ifExists().execute();
}

export async function down(_database: Kysely<unknown>): Promise<void> {
  // Recreating _prisma_migrations is possible but not implemented;
  // rollback would require the full Prisma table schema and is rarely needed.
}
