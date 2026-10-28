import { type NestNodeApplication, NodeAdapter } from '@nestjs/platform-node';
import { Test } from '@nestjs/testing';
import { configureApp } from '@/app.configurator';
import { AppModule } from '@/app.module';

async function createAppE2E(): Promise<NestNodeApplication> {
  const moduleReference = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleReference.createNestApplication<NestNodeApplication>(new NodeAdapter());
  configureApp(app);
  await app.init();
  return app;
}

export { createAppE2E };
