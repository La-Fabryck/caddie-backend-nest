import { fastifyCookie } from '@fastify/cookie';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

type ErrorInterfaceBody = { type: string; message: string };
export type ErrorInterface = Record<string, ErrorInterfaceBody[]>;

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  app.register(fastifyCookie);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (errors) => {
        const result: Record<string, ErrorInterfaceBody[]> = errors.reduce(
          (accumulator, currentValue) => {
            const formattedErrors: ErrorInterfaceBody[] = Object.entries(currentValue.constraints ?? {}).map(([key, value]) => {
              return {
                type: key,
                message: value,
              };
            });

            accumulator[currentValue.property] = formattedErrors;
            return accumulator;
          },
          {} as Record<string, ErrorInterfaceBody[]>,
        );
        return new BadRequestException(result);
      },
    }),
  );

  await app.listen(3001, '0.0.0.0');
}

bootstrap();
