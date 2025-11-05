import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { configureApp } from './app.configurator';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  await configureApp(app);

  //TODO: Use injection not env var
  //@ts-expect-error use nest config
  await app.listen({ port: 3001, host: process.env.LISTEN_IP });
}

// eslint-disable-next-line unicorn/prefer-top-level-await
void bootstrap();
