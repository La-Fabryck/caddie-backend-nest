import path from 'node:path';
import { defineConfig } from 'kysely-ctl';
import { Pool } from 'pg';

export default defineConfig({
  dialect: 'pg',
  dialectConfig: {
    pool: new Pool({
      connectionString: process.env['DATABASE_URL'],
      max: 10,
    }),
  },
  migrations: {
    migrationFolder: path.join(process.cwd(), 'migrations'),
  },
});
