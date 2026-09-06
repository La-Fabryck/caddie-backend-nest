import { z, type ZodString } from 'zod';

/** Trims the string, then rejects empty. */
export function zNotBlank(message: string): ZodString {
  return z.string(message).trim().nonempty(message);
}
