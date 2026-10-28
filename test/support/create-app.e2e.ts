import { type NestNodeApplication, NodeAdapter } from '@nestjs/platform-node';
import { Test } from '@nestjs/testing';
import { configureApp } from '@/app.configurator';
import { AppModule } from '@/app.module';
import { type E2EApplication, type InjectOptions, injectRequest, type InjectResult } from './inject-e2e';

function injectBound(baseUrl: string): (options: InjectOptions) => Promise<InjectResult> {
  async function inject(options: InjectOptions): Promise<InjectResult> {
    return injectRequest(baseUrl, options);
  }
  return inject;
}

async function createAppE2E(): Promise<E2EApplication> {
  const moduleReference = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleReference.createNestApplication<NestNodeApplication>(new NodeAdapter());
  configureApp(app);
  await app.listen(0, '127.0.0.1');
  const baseUrl = await app.getUrl();

  return Object.assign(app, { inject: injectBound(baseUrl) });
}

export { createAppE2E, type E2EApplication };
