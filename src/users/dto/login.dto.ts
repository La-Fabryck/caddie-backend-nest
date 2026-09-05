import { z } from 'zod';
import { zNotBlank } from '@/lib/zod/z-not-blank';
import { INVALID_EMAIL, INVALID_PASSWORD } from '../messages/authentication';

export const loginSchema = z.object({
  email: zNotBlank(INVALID_EMAIL),
  password: zNotBlank(INVALID_PASSWORD),
});
export type LoginDto = z.infer<typeof loginSchema>;
