import { z } from 'zod';
import { zNotBlank } from '@/lib/zod/z-not-blank';
import { USER_EMAIL, USER_NAME, USER_PASSWORD } from '../messages/user';
import { PASSWORD_REGEX } from '../utils/constants';

const USER_NAME_MIN_LENGTH = 2;
/** Matches `User.name` varchar(50). */
export const USER_NAME_MAX_LENGTH = 50;

export const createUserSchema = z.object({
  email: z.email(USER_EMAIL).trim(),
  name: zNotBlank(USER_NAME).min(USER_NAME_MIN_LENGTH, USER_NAME).max(USER_NAME_MAX_LENGTH, USER_NAME),
  password: z.string(USER_PASSWORD).trim().regex(PASSWORD_REGEX, USER_PASSWORD),
});
export type CreateUserDto = z.infer<typeof createUserSchema>;
