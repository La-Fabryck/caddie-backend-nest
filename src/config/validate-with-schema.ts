import { z } from 'zod';

export function validateWithSchema<T>(schema: z.ZodType<T>, plain: Record<string, unknown>, errorPrefix: string): T {
  const result = schema.safeParse(plain);
  if (!result.success) {
    throw new Error(`${errorPrefix}: ${result.error.issues.map((issue) => issue.message).join('; ')}`);
  }
  return result.data;
}
