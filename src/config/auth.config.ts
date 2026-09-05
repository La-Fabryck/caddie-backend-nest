import { registerAs } from '@nestjs/config';
import { z } from 'zod';
import { zMsDuration } from '@/lib/zod/z-ms-duration';
import { validateWithSchema } from './validate-with-schema';

const authConfigSchema = z.object({
  accessCookieName: z.string().nonempty(),
  refreshCookieName: z.string().nonempty(),
  accessTokenSecret: z.string().nonempty(),
  refreshTokenSecret: z.string().nonempty(),
  accessTokenTtl: zMsDuration(),
  refreshTokenTtl: zMsDuration(),
});

export type AuthConfig = z.infer<typeof authConfigSchema>;

export default registerAs('auth', (): AuthConfig => {
  const plain: Record<string, unknown> = {
    accessCookieName: process.env['ACCESS_COOKIE_NAME'],
    refreshCookieName: process.env['REFRESH_COOKIE_NAME'],
    accessTokenSecret: process.env['ACCESS_TOKEN_SECRET'],
    refreshTokenSecret: process.env['REFRESH_TOKEN_SECRET'],
    accessTokenTtl: process.env['ACCESS_TOKEN_TTL'],
    refreshTokenTtl: process.env['REFRESH_TOKEN_TTL'],
  };

  return validateWithSchema(authConfigSchema, plain, 'Auth configuration validation failed');
});
