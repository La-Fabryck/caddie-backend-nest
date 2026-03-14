import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { configureApp } from './app.configurator';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  await configureApp(app);

  const configService = app.get(ConfigService);

  const port = configService.getOrThrow<string>('NEST_PORT');
  const host = configService.getOrThrow<string>('NEST_IP');

  await app.listen({ port: Number.parseInt(port), host });
}

// eslint-disable-next-line unicorn/prefer-top-level-await
void bootstrap();
