import { faker } from '@faker-js/faker';
import { HttpStatus } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { ErrorInterface } from '@/app.configurator';
import type { ItemTypeRow } from '@/database/database-types';
import { resourceCreator } from 'test/creator/resource-creator';
import { createAppE2E } from 'test/support/create-app.e2e';

describe('ItemTypeController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createAppE2E();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/item-types (POST)', () => {
    it('OK - Creates an item type', async () => {
      await using creator = await resourceCreator(app);
      const label = faker.commerce.department();

      const result = await app.inject({
        method: 'POST',
        url: '/item-types',
        body: { label },
        cookies: creator.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.CREATED);
      const payload = JSON.parse(result.payload) as ItemTypeRow;
      expect(payload.id).toBeTruthy();
      expect(payload.label).toEqual(label);
      expect(payload.userId).toEqual(creator.user.id);
    });

    it('KO - Fails validation', async () => {
      await using creator = await resourceCreator(app);

      const result = await app.inject({
        method: 'POST',
        url: '/item-types',
        body: {},
        cookies: creator.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST);
      const payload = JSON.parse(result.payload) as ErrorInterface;
      expect(payload).toStrictEqual({
        label: [{ message: 'ITEM_TYPE_LABEL' }],
      });
    });
  });

  describe('/item-types (GET)', () => {
    it('OK - Lists only current user item types', async () => {
      await using creator = await resourceCreator(app);
      await using outsider = await resourceCreator(app);

      await app.inject({
        method: 'POST',
        url: '/item-types',
        body: { label: faker.commerce.department() },
        cookies: creator.cookies,
      });
      await app.inject({
        method: 'POST',
        url: '/item-types',
        body: { label: faker.commerce.department() },
        cookies: outsider.cookies,
      });

      const result = await app.inject({
        method: 'GET',
        url: '/item-types',
        cookies: creator.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.OK);
      const payload = JSON.parse(result.payload) as ItemTypeRow[];

      const single = 1;
      expect(payload.length).toBe(single);

      expect(payload.every((itemType) => itemType.userId === creator.user.id)).toBe(true);
    });
  });

  describe('/item-types/:id (PATCH, DELETE)', () => {
    it('KO - Cannot update another user type', async () => {
      await using creator = await resourceCreator(app);
      await using outsider = await resourceCreator(app);

      const createResult = await app.inject({
        method: 'POST',
        url: '/item-types',
        body: { label: faker.commerce.department() },
        cookies: outsider.cookies,
      });
      const outsiderType = JSON.parse(createResult.payload) as ItemTypeRow;

      const result = await app.inject({
        method: 'PATCH',
        url: `/item-types/${outsiderType.id}`,
        body: { label: faker.commerce.department() },
        cookies: creator.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.NOT_FOUND);
    });

    it('KO - Cannot delete another user type', async () => {
      await using creator = await resourceCreator(app);
      await using outsider = await resourceCreator(app);

      const createResult = await app.inject({
        method: 'POST',
        url: '/item-types',
        body: { label: faker.commerce.department() },
        cookies: outsider.cookies,
      });
      const outsiderType = JSON.parse(createResult.payload) as ItemTypeRow;

      const result = await app.inject({
        method: 'DELETE',
        url: `/item-types/${outsiderType.id}`,
        cookies: creator.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.NOT_FOUND);
    });
  });
});
