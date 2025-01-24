import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { type RawServerDefault } from 'fastify';
import { AppModule } from 'src/app.module';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication<RawServerDefault>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication(new FastifyAdapter());

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it('/ (GET)', async () => {
    const result = await app.inject({
      method: 'GET',
      url: '/',
    });
    expect(result.statusCode).toEqual(200);
    expect(result.payload).toEqual('Hello World!');
  });

  afterAll(async () => {
    await app.close();
  });
});
