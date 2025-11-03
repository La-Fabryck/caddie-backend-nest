import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { configureApp } from '@/app.configurator';
import { AppModule } from '@/app.module';

async function createAppE2E(): Promise<NestFastifyApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: NestFastifyApplication = moduleRef.createNestApplication(new FastifyAdapter());
  await configureApp(app);

  await app.init();
  return app;
}

export { createAppE2E };
