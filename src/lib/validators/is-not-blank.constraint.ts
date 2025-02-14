import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isNotBlank' })
export class IsNotBlankConstraint implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  validate(value: unknown): boolean {
    if (value == null) {
      return false;
    }

    return typeof value === 'string' && value.trim() !== '';
  }
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must not be blank.`;
  }
}
