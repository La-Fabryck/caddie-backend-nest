import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { type NestNodeApplication, NodeAdapter } from '@nestjs/platform-node';
import type { AppConfig } from '@/config/app.config';
import { configureApp } from './app.configurator';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestNodeApplication>(AppModule, new NodeAdapter(), {
    routeConflictPolicy: { duplicate: 'error' },
  });
  configureApp(app);
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const appConfig = configService.getOrThrow<AppConfig>('app');

  await app.listen(appConfig.listenPort, appConfig.listenHost);
}

await bootstrap();
