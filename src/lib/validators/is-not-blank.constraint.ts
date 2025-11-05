import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isNotBlank' })
export class IsNotBlankConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value == null) {
      return false;
    }

    return typeof value === 'string' && value.trim() !== '';
  }

  defaultMessage(arguments_: ValidationArguments): string {
    return `${arguments_.property} must not be blank.`;
  }
}
