import path from 'node:path';
import { defineConfig } from 'kysely-codegen';

function getRequired(environment: NodeJS.ProcessEnv, key: string): string {
  const value = environment[key];
  if (value == null || value.trim() === '') {
    throw new Error(`Set ${key} in .env`);
  }
  return value;
}

const user = encodeURIComponent(getRequired(process.env, 'POSTGRES_USER'));
const password = encodeURIComponent(getRequired(process.env, 'POSTGRES_PASSWORD'));
const host = getRequired(process.env, 'POSTGRES_HOST');
const port = getRequired(process.env, 'POSTGRES_PORT');
const database = getRequired(process.env, 'POSTGRES_DB');

export default defineConfig({
  dialect: 'postgres',
  excludePattern: 'kysely_migration*',
  outFile: path.join(process.cwd(), 'src/database/database-raw.d.ts'),
  url: `postgres://${user}:${password}@${host}:${port}/${database}`,
});
