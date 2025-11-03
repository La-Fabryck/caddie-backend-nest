import { fastifyCookie } from '@fastify/cookie';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { type NestFastifyApplication } from '@nestjs/platform-fastify';

type ErrorInterfaceBody = { message: string };
export type ErrorInterface = Record<string, ErrorInterfaceBody[]>;

function configureApp(app: NestFastifyApplication): void {
  app.register(fastifyCookie);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (errors) => {
        const result = errors.reduce<Record<string, ErrorInterfaceBody[]>>((accumulator, currentValue) => {
          const formattedErrors: ErrorInterfaceBody[] = Object.entries(currentValue.constraints ?? {}).map(([_key, value]) => {
            return {
              message: value,
            };
          });

          accumulator[currentValue.property] = formattedErrors;
          return accumulator;
        }, {});
        return new BadRequestException(result);
      },
    }),
  );
}

export { configureApp };
