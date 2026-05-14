import {
  type ValidationArguments,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';
import ms, { type StringValue } from 'ms';

/**
 * Parses strings the same way `ms` / JWT `expiresIn` does. `StringValue` from `ms` is only a
 * compile-time union; this is the practical runtime check.
 */
@ValidatorConstraint({ name: 'isMsDurationString', async: false })
export class IsMsDurationStringConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string' || value.trim() === '') {
      return false;
    }
    try {
      const parsed = ms(value as StringValue);
      return typeof parsed === 'number' && Number.isFinite(parsed);
    } catch {
      return false;
    }
  }

  defaultMessage(validationArguments: ValidationArguments): string {
    return `${validationArguments.property} must be a duration string accepted by ms (e.g. 15m, 7d, 3600000)`;
  }
}
