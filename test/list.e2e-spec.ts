import { faker } from '@faker-js/faker';
import { HttpStatus } from '@nestjs/common';
import { type NestFastifyApplication } from '@nestjs/platform-fastify';
import { type List } from '@prisma/client';
import { type ErrorInterface } from '@/app.configurator';
import { type CreateListDto } from '@/shopping/dto/create-list.dto';
import { type UpdateListDto } from '@/shopping/dto/update-list.dto';
import { ListService, type ListWithSubs } from '@/shopping/list/list.service';
import { createAppE2E } from './create-app.e2e';
import { resourceCreator } from './creator/resource-creator';

describe('ListController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createAppE2E();
    await app.getHttpAdapter().getInstance().ready();
  });

  describe('/list (POST)', () => {
    it('OK - Creates a list', async () => {
      await using creator = await resourceCreator(app);

      const list: CreateListDto = {
        title: faker.food.dish(),
        pseudonym: faker.person.firstName(),
      };

      const result = await app.inject({
        method: 'POST',
        url: '/list',
        body: list,
        cookies: creator.cookies,
      });
      expect(result.statusCode).toEqual(HttpStatus.CREATED);

      const payload = JSON.parse(result.payload) as ListWithSubs;
      expect(payload.title).toEqual(list.title);
      expect(payload.subscribers.some((subscriber) => subscriber.name)).toBeTruthy();
    });

    it('KO - User not authenticated', async () => {
      const result = await app.inject({
        method: 'POST',
        url: '/list',
        body: {},
      });

      expect(result.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('KO - Fails validation', async () => {
      await using creator = await resourceCreator(app);

      const result = await app.inject({
        method: 'POST',
        url: '/list',
        body: {},
        cookies: creator.cookies,
      });
      expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST);

      const payload = JSON.parse(result.payload) as ErrorInterface;
      expect(payload).toStrictEqual({
        title: [{ message: 'LIST_TITLE' }],
        pseudonym: [{ message: 'LIST_PSEUDONYM' }],
      });
    });
  });

  describe('/list (GET)', () => {
    it('OK - Finds list from a User', async () => {
      await using creator = await resourceCreator(app, { listQuantity: faker.number.int({ min: 1, max: 3 }) });

      const result = await app.inject({
        method: 'GET',
        url: '/list',
        cookies: creator.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.OK);

      const payload = JSON.parse(result.payload) as List[];
      expect(payload).not.toHaveLength(0);
      for (const expectedList of payload) {
        const storedList = creator.lists.find((storedList) => storedList.id === expectedList.id);
        expect(storedList).not.toBeNull();
        expect(expectedList.title).toEqual(storedList?.title);
      }
    });

    it('KO - User not authenticated', async () => {
      const result = await app.inject({
        method: 'GET',
        url: '/list',
      });

      expect(result.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('/list/:id (GET)', () => {
    it('OK - Finds a list by its id', async () => {
      await using creator = await resourceCreator(app, { listQuantity: faker.number.int({ min: 1, max: 1 }) });
      const [storedList] = creator.lists;

      const result = await app.inject({
        method: 'GET',
        url: `/list/${storedList.id}`,
        cookies: creator.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.OK);

      const payload = JSON.parse(result.payload) as List;
      expect(payload.title).toEqual(storedList.title);
    });

    it('KO - Requires to be authenticated', async () => {
      const result = await app.inject({
        method: 'GET',
        url: `/list/${faker.string.uuid()}`,
      });

      expect(result.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('KO - Returns Not Found for non-existent resource', async () => {
      await using creator = await resourceCreator(app, { listQuantity: faker.number.int({ min: 1, max: 1 }) });

      const result = await app.inject({
        method: 'GET',
        url: `/list/${faker.string.uuid()}`,
        cookies: creator.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.NOT_FOUND);
    });
  });

  describe('/list/:id (PATCH)', () => {
    it('OK - Update a list', async () => {
      await using creator = await resourceCreator(app, { listQuantity: faker.number.int({ min: 1, max: 1 }) });
      const [storedList] = creator.lists;

      const updatePayload: UpdateListDto = {
        title: faker.food.dish(),
      };

      const result = await app.inject({
        method: 'PATCH',
        url: `/list/${storedList.id}`,
        body: updatePayload,
        cookies: creator.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.OK);

      const payload = JSON.parse(result.payload) as List;
      expect(payload.title).toEqual(updatePayload.title);
    });

    it('KO - User not authenticated', async () => {
      const result = await app.inject({
        method: 'PATCH',
        url: `/list/${faker.string.uuid()}`,
        body: {},
      });

      expect(result.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('KO - Returns Not Found for non-existent resource', async () => {
      await using creator = await resourceCreator(app, { listQuantity: faker.number.int({ min: 1, max: 1 }) });

      const result = await app.inject({
        method: 'PATCH',
        url: `/list/${faker.string.uuid()}`,
        cookies: creator.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.NOT_FOUND);
    });
  });

  describe('/list/:id (DELETE)', () => {
    it('OK - Update a list', async () => {
      await using creator = await resourceCreator(app, { listQuantity: faker.number.int({ min: 1, max: 1 }) });
      const [storedList] = creator.lists;

      const result = await app.inject({
        method: 'DELETE',
        url: `/list/${storedList.id}`,
        cookies: creator.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.OK);

      const listService = app.get(ListService);
      const remainingLists = await listService.findListsBySubscriber({ user: creator.user });
      expect(remainingLists).toHaveLength(0);
    });

    it('KO - User not authenticated', async () => {
      const result = await app.inject({
        method: 'DELETE',
        url: `/list/${faker.string.uuid()}`,
      });

      expect(result.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('KO - Returns Not Found for non-existent resource', async () => {
      await using creator = await resourceCreator(app, { listQuantity: faker.number.int({ min: 1, max: 1 }) });

      const result = await app.inject({
        method: 'DELETE',
        url: `/list/${faker.string.uuid()}`,
        cookies: creator.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.NOT_FOUND);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
