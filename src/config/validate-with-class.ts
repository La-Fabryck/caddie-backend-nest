import { plainToInstance } from 'class-transformer';
import { validateSync, type ValidationError } from 'class-validator';

type Constructor<T extends object> = new () => T;

function formatValidationErrors(errors: ValidationError[]): string {
  const messages: string[] = [];

  function walk(items: ValidationError[]): void {
    for (const error of items) {
      if (error.constraints != null) {
        messages.push(...Object.values(error.constraints));
      }
      if (error.children != null && error.children.length > 0) {
        walk(error.children);
      }
    }
  }

  walk(errors);
  return messages.join('; ');
}

/**
 * Validates a configuration plain object using `plainToInstance` + `validateSync`,
 * then throws with readable messages on failure. Used by `registerAs` factories.
 */
export function validateWithClass<T extends object>(Target: Constructor<T>, plain: Record<string, unknown>, errorPrefix: string): T {
  const validated = plainToInstance(Target, plain, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, {
    forbidUnknownValues: false,
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`${errorPrefix}: ${formatValidationErrors(errors)}`);
  }

  return validated;
}
