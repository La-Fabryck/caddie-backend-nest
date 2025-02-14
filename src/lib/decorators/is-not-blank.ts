import { registerDecorator, type ValidationOptions } from 'class-validator';
import { IsNotBlankConstraint } from '../validators/is-not-blank.constraint';

/**
 * Checks if trimmed given value is not empty (!== '', !== null, !== undefined)
 */
export function IsNotBlank(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions ?? {},
      constraints: [],
      validator: IsNotBlankConstraint,
    });
  };
}
