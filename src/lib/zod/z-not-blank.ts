import { z } from 'zod';

/** Trims the string, then rejects empty. */
export function zNotBlank(message: string) {
  return z.string(message).trim().nonempty(message);
}
