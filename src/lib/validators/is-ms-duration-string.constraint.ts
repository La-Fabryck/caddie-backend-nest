import { type ValidationArguments, ValidatorConstraint, type ValidatorConstraintInterface } from 'class-validator';
import ms, { StringValue } from 'ms';

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
      /**
       * `ms` typings only accept `StringValue` (a template union). Config/env values are plain
       * `string`; this constraint is the runtime check. Widen the parse overload once instead of
       * asserting each value is already a valid duration.
       */
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- adapt ms StringValue input to string for validation
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
