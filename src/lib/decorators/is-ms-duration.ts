import { registerDecorator, type ValidationOptions } from 'class-validator';
import { IsMsDurationStringConstraint } from '../validators/is-ms-duration-string.constraint';

/** Ensures the value is a non-empty duration string understood by the `ms` package. */
export function IsMsDurationString(validationOptions?: ValidationOptions): PropertyDecorator {
  return (object: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'isMsDurationString',
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions ?? {},
      constraints: [],
      validator: IsMsDurationStringConstraint,
    });
  };
}
