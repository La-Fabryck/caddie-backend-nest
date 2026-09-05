import { registerAs } from '@nestjs/config';
import { z } from 'zod';
import { MAX_TCP_PORT, MIN_TCP_PORT } from './tcp-port-bounds';
import { validateWithSchema } from './validate-with-schema';

const appConfigSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']),
  listenHost: z.string().nonempty(),
  listenPort: z.coerce.number().int().min(MIN_TCP_PORT).max(MAX_TCP_PORT),
});

export type AppConfig = z.infer<typeof appConfigSchema>;

export default registerAs('app', (): AppConfig => {
  const plain: Record<string, unknown> = {
    nodeEnv: process.env['NODE_ENV'],
    listenHost: process.env['NEST_IP'],
    listenPort: process.env['NEST_PORT'],
  };

  return validateWithSchema(appConfigSchema, plain, 'App configuration validation failed');
});
