import { registerDecorator, type ValidationOptions } from 'class-validator';
import { IsMsDurationStringConstraint } from '../validators/is-ms-duration-string.constraint';

/** Ensures the value is a non-empty duration string understood by the `ms` package. */
export function IsMsDurationString(validationOptions: ValidationOptions = {}): PropertyDecorator {
  return (object: object, propertyName: string | symbol) => {
    // class-validator only registers string keys; PropertyDecorator also allows symbols
    if (typeof propertyName !== 'string') {
      throw new TypeError('IsMsDurationString only supports string property keys');
    }

    registerDecorator({
      name: 'isMsDurationString',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsMsDurationStringConstraint,
    });
  };
}
