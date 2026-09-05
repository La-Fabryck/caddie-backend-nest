import { registerAs } from '@nestjs/config';
import { z } from 'zod';
import { MAX_TCP_PORT, MIN_TCP_PORT } from './tcp-port-bounds';
import { validateWithSchema } from './validate-with-schema';

const databaseConfigSchema = z.object({
  host: z.string().nonempty(),
  port: z.coerce.number().int().min(MIN_TCP_PORT).max(MAX_TCP_PORT),
  user: z.string().nonempty(),
  password: z.string().nonempty(),
  database: z.string().nonempty(),
});

export type DatabaseConfig = z.infer<typeof databaseConfigSchema>;

export default registerAs('database', (): DatabaseConfig => {
  const plain: Record<string, unknown> = {
    host: process.env['POSTGRES_HOST'],
    port: process.env['POSTGRES_PORT'],
    user: process.env['POSTGRES_USER'],
    password: process.env['POSTGRES_PASSWORD'],
    database: process.env['POSTGRES_DB'],
  };

  return validateWithSchema(databaseConfigSchema, plain, 'Database configuration validation failed');
});
