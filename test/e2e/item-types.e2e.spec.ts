import { faker } from '@faker-js/faker';
import { HttpStatus } from '@nestjs/common';
import type { NestNodeApplication } from '@nestjs/platform-node';
import request from 'supertest';
import type { ErrorInterface } from '@/app.configurator';
import type { ItemTypeRow } from '@/database/database-types';
import { resourceCreator } from 'test/creator/resource-creator';
import { createAppE2E } from 'test/support/create-app.e2e';
import { cookieHeader } from 'test/support/http';

describe('ItemTypeController (e2e)', () => {
  let app: NestNodeApplication;

  beforeAll(async () => {
    app = await createAppE2E();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/item-types (POST)', () => {
    it('OK - Creates an item type', async () => {
      await using creator = await resourceCreator(app);
      const label = faker.commerce.department();

      const result = await request(app.getHttpServer()).post('/item-types').set('Cookie', cookieHeader(creator.cookies)).send({ label });

      expect(result.status).toEqual(HttpStatus.CREATED);
      const payload = JSON.parse(result.text) as ItemTypeRow;
      expect(payload.id).toBeTruthy();
      expect(payload.label).toEqual(label);
      expect(payload.userId).toEqual(creator.user.id);
    });

    it('KO - Fails validation', async () => {
      await using creator = await resourceCreator(app);

      const result = await request(app.getHttpServer()).post('/item-types').set('Cookie', cookieHeader(creator.cookies)).send({});

      expect(result.status).toEqual(HttpStatus.BAD_REQUEST);
      const payload = JSON.parse(result.text) as ErrorInterface;
      expect(payload).toStrictEqual({
        label: [{ message: 'ITEM_TYPE_LABEL' }],
      });
    });

    it('KO - Rejects duplicate label', async () => {
      await using creator = await resourceCreator(app);
      const label = faker.commerce.department();

      const first = await request(app.getHttpServer()).post('/item-types').set('Cookie', cookieHeader(creator.cookies)).send({ label });
      expect(first.status).toEqual(HttpStatus.CREATED);

      const result = await request(app.getHttpServer()).post('/item-types').set('Cookie', cookieHeader(creator.cookies)).send({ label });

      expect(result.status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
      const payload = JSON.parse(result.text) as ErrorInterface;
      expect(payload).toStrictEqual({
        label: [{ message: 'ITEM_TYPE_LABEL_NOT_UNIQUE' }],
      });
    });

    it('KO - Rejects duplicate label case-insensitively', async () => {
      await using creator = await resourceCreator(app);
      const label = 'Produce';

      const first = await request(app.getHttpServer()).post('/item-types').set('Cookie', cookieHeader(creator.cookies)).send({ label });
      expect(first.status).toEqual(HttpStatus.CREATED);

      const result = await request(app.getHttpServer())
        .post('/item-types')
        .set('Cookie', cookieHeader(creator.cookies))
        .send({ label: label.toLowerCase() });

      expect(result.status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
      const payload = JSON.parse(result.text) as ErrorInterface;
      expect(payload).toStrictEqual({
        label: [{ message: 'ITEM_TYPE_LABEL_NOT_UNIQUE' }],
      });
    });
  });

  describe('/item-types (GET)', () => {
    it('OK - Lists only current user item types', async () => {
      await using creator = await resourceCreator(app);
      await using outsider = await resourceCreator(app);

      await request(app.getHttpServer())
        .post('/item-types')
        .set('Cookie', cookieHeader(creator.cookies))
        .send({ label: faker.commerce.department() });
      await request(app.getHttpServer())
        .post('/item-types')
        .set('Cookie', cookieHeader(outsider.cookies))
        .send({ label: faker.commerce.department() });

      const result = await request(app.getHttpServer()).get('/item-types').set('Cookie', cookieHeader(creator.cookies));

      expect(result.status).toEqual(HttpStatus.OK);
      const payload = JSON.parse(result.text) as ItemTypeRow[];

      const single = 1;
      expect(payload.length).toBe(single);

      expect(payload.every((itemType) => itemType.userId === creator.user.id)).toBe(true);
    });
  });

  describe('/item-types/:id (PATCH, DELETE)', () => {
    it('KO - Rejects duplicate label on update', async () => {
      await using creator = await resourceCreator(app);

      const first = await request(app.getHttpServer())
        .post('/item-types')
        .set('Cookie', cookieHeader(creator.cookies))
        .send({ label: 'Dairy' });
      expect(first.status).toEqual(HttpStatus.CREATED);

      const second = await request(app.getHttpServer())
        .post('/item-types')
        .set('Cookie', cookieHeader(creator.cookies))
        .send({ label: 'Bakery' });
      expect(second.status).toEqual(HttpStatus.CREATED);
      const secondType = JSON.parse(second.text) as ItemTypeRow;

      const result = await request(app.getHttpServer())
        .patch(`/item-types/${secondType.id}`)
        .set('Cookie', cookieHeader(creator.cookies))
        .send({ label: 'Dairy' });

      expect(result.status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
      const payload = JSON.parse(result.text) as ErrorInterface;
      expect(payload).toStrictEqual({
        label: [{ message: 'ITEM_TYPE_LABEL_NOT_UNIQUE' }],
      });
    });

    it('KO - Cannot update another user type', async () => {
      await using creator = await resourceCreator(app);
      await using outsider = await resourceCreator(app);

      const createResult = await request(app.getHttpServer())
        .post('/item-types')
        .set('Cookie', cookieHeader(outsider.cookies))
        .send({ label: faker.commerce.department() });
      const outsiderType = JSON.parse(createResult.text) as ItemTypeRow;

      const result = await request(app.getHttpServer())
        .patch(`/item-types/${outsiderType.id}`)
        .set('Cookie', cookieHeader(creator.cookies))
        .send({ label: faker.commerce.department() });

      expect(result.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('KO - Cannot delete another user type', async () => {
      await using creator = await resourceCreator(app);
      await using outsider = await resourceCreator(app);

      const createResult = await request(app.getHttpServer())
        .post('/item-types')
        .set('Cookie', cookieHeader(outsider.cookies))
        .send({ label: faker.commerce.department() });
      const outsiderType = JSON.parse(createResult.text) as ItemTypeRow;

      const result = await request(app.getHttpServer())
        .delete(`/item-types/${outsiderType.id}`)
        .set('Cookie', cookieHeader(creator.cookies));

      expect(result.status).toEqual(HttpStatus.NOT_FOUND);
    });
  });
});
