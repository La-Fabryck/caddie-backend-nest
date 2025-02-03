import { fastifyCookie } from '@fastify/cookie';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

type ErrorInterfaceBody = { message: string };
export type ErrorInterface = Record<string, ErrorInterfaceBody[]>;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  await app.register(fastifyCookie);
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

  //TODO: Use injection not env var
  //@ts-expect-error use nest config
  await app.listen({ port: 3001, host: process.env.LISTEN_IP });
}

void bootstrap();
