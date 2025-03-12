import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isNotBlank' })
export class IsNotBlankConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value == null) {
      return false;
    }

    return typeof value === 'string' && value.trim() !== '';
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must not be blank.`;
  }
}
