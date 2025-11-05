import { fastifyCookie } from '@fastify/cookie';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { type NestFastifyApplication } from '@nestjs/platform-fastify';

type ErrorInterfaceBody = { message: string };
export type ErrorInterface = Record<string, ErrorInterfaceBody[]>;

async function configureApp(app: NestFastifyApplication): Promise<void> {
  await app.register(fastifyCookie);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (errors) => {
        const result: Record<string, ErrorInterfaceBody[]> = {};

        for (const error of errors) {
          const formattedErrors: ErrorInterfaceBody[] = Object.entries(error.constraints ?? {}).map(([_key, value]) => {
            return {
              message: value,
            };
          });

          result[error.property] = formattedErrors;
        }

        return new BadRequestException(result);
      },
    }),
  );
}
export { configureApp };
