import { fastifyCookie } from '@fastify/cookie';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.register(fastifyCookie);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(3001, '0.0.0.0');
}

bootstrap();
