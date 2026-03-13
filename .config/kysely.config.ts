import path from 'node:path';
import { config } from 'dotenv';
import { defineConfig } from 'kysely-ctl';
import { Pool } from 'pg';

config();

function getRequired(environment: NodeJS.ProcessEnv, key: string): string {
  const value = environment[key];
  if (value == null || value.trim() === '') {
    throw new Error(`Set ${key} in .env`);
  }
  return value;
}

export default defineConfig({
  dialect: 'pg',
  dialectConfig: {
    pool: new Pool({
      host: getRequired(process.env, 'POSTGRES_HOST'),
      port: Number.parseInt(getRequired(process.env, 'POSTGRES_PORT')),
      user: getRequired(process.env, 'POSTGRES_USER'),
      password: getRequired(process.env, 'POSTGRES_PASSWORD'),
      database: getRequired(process.env, 'POSTGRES_DB'),
      max: 10,
    }),
  },
  migrations: {
    migrationFolder: path.join(process.cwd(), 'migrations'),
  },
});
