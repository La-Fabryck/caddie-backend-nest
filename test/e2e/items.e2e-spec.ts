import { faker } from '@faker-js/faker';
import { HttpStatus } from '@nestjs/common';
import { type NestFastifyApplication } from '@nestjs/platform-fastify';
import { type Item } from '@prisma/client';
import { type ErrorInterface } from '@/app.configurator';
import { type CreateItemDto } from '@/shopping/dto/create-item.dto';
import { type UpdateItemDto } from '@/shopping/dto/update-item.dto';
import { ItemService } from '@/shopping/item/item.service';
import { resourceCreator } from 'test/creator/resource-creator';
import { SINGLE } from 'test/support/constants';
import { createAppE2E } from 'test/support/create-app.e2e';

describe('ItemController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createAppE2E();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/list/:listId/items (POST)', () => {
    it('OK - Creates a list', async () => {
      await using creator = await resourceCreator(app, { list: { quantity: SINGLE } });
      const [storedList] = creator.lists;

      const item: CreateItemDto = {
        name: faker.food.ingredient(),
      };

      const result = await app.inject({
        method: 'POST',
        url: `/list/${storedList.id}/items`,
        body: item,
        cookies: creator.cookies,
      });
      expect(result.statusCode).toEqual(HttpStatus.CREATED);

      const payload = JSON.parse(result.payload) as Item;
      expect(payload.name).toEqual(item.name);
      expect(payload.isInCart).toEqual(false);
      expect(payload.listId).toEqual(storedList.id);
      expect(payload.id).toBeTruthy();
    });

    it('KO - User not authenticated', async () => {
      const result = await app.inject({
        method: 'POST',
        url: `/list/${faker.string.uuid()}/items`,
        body: {},
      });

      expect(result.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('KO - Fails validation', async () => {
      await using creator = await resourceCreator(app);

      const result = await app.inject({
        method: 'POST',
        url: `/list/${faker.string.uuid()}/items`,
        body: {},
        cookies: creator.cookies,
      });
      expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST);

      const payload = JSON.parse(result.payload) as ErrorInterface;
      expect(payload).toStrictEqual({
        name: [{ message: 'ITEM_NAME' }],
      });
    });
  });

  describe('/list/:listId/items (GET)', () => {
    it('OK - Finds items in a list from a User', async () => {
      await using creator = await resourceCreator(app, {
        list: { quantity: SINGLE },
        items: { quantity: faker.number.int({ min: 1, max: 3 }) },
      });
      const [storedList] = creator.lists;

      const result = await app.inject({
        method: 'GET',
        url: `/list/${storedList.id}/items`,
        cookies: creator.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.OK);

      const payload = JSON.parse(result.payload) as Item[];
      expect(payload).not.toHaveLength(0);
      for (const expectedItems of payload) {
        const storedItems = creator.items.find((storedList) => storedList.id === expectedItems.id);
        expect(storedItems).not.toBeNull();
        expect(expectedItems.name).toEqual(storedItems?.name);
      }
    });

    it('KO - User not authenticated', async () => {
      const result = await app.inject({
        method: 'GET',
        url: `/list/${faker.string.uuid()}/items`,
      });

      expect(result.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('/list/:listId/items/:itemId (GET)', () => {
    it('OK - Finds an item by its id', async () => {
      await using creator = await resourceCreator(app, { list: { quantity: SINGLE }, items: { quantity: SINGLE } });
      const [storedList] = creator.lists;
      const [storedItem] = creator.items;

      const result = await app.inject({
        method: 'GET',
        url: `/list/${storedList.id}/items/${storedItem.id}`,
        cookies: creator.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.OK);

      const payload = JSON.parse(result.payload) as Item;
      expect(payload.listId).toEqual(storedItem.listId);
      expect(payload.id).toEqual(storedItem.id);
      expect(payload.name).toEqual(storedItem.name);
      expect(payload.isInCart).toEqual(storedItem.isInCart);
    });

    it('KO - Requires to be authenticated', async () => {
      const result = await app.inject({
        method: 'GET',
        url: `/list/${faker.string.uuid()}/items/${faker.string.uuid()}`,
      });

      expect(result.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('KO - Returns Not Found for non-existent resource', async () => {
      await using creator = await resourceCreator(app, { list: { quantity: SINGLE } });
      const [storedList] = creator.lists;

      const result = await app.inject({
        method: 'GET',
        url: `/list/${storedList.id}/items/${faker.string.uuid()}`,
        cookies: creator.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.NOT_FOUND);
    });
  });

  describe('/list/:listId/items/:itemId (PATCH)', () => {
    it('OK - Update an item', async () => {
      await using creator = await resourceCreator(app, { list: { quantity: SINGLE }, items: { quantity: SINGLE } });
      const [storedList] = creator.lists;
      const [storedItem] = creator.items;

      const updatePayload: UpdateItemDto = {
        name: faker.food.ingredient(),
        isInCart: faker.datatype.boolean(),
      };

      const result = await app.inject({
        method: 'PATCH',
        url: `/list/${storedList.id}/items/${storedItem.id}`,
        body: updatePayload,
        cookies: creator.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.OK);

      const payload = JSON.parse(result.payload) as Item;
      expect(payload.name).toEqual(updatePayload.name);
      expect(payload.isInCart).toEqual(updatePayload.isInCart);
    });

    it('KO - User not authenticated', async () => {
      const result = await app.inject({
        method: 'PATCH',
        url: `/list/${faker.string.uuid()}/items/${faker.string.uuid()}`,
        body: {},
      });

      expect(result.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('KO - Returns Not Found for non-existent resource', async () => {
      await using creator = await resourceCreator(app, { list: { quantity: SINGLE } });
      const [storedList] = creator.lists;

      const result = await app.inject({
        method: 'PATCH',
        url: `/list/${storedList.id}/items/${faker.string.uuid()}`,
        cookies: creator.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.NOT_FOUND);
    });
  });

  describe('/list/:listId/items/:itemId (DELETE)', () => {
    it('OK - Delete a list', async () => {
      await using creator = await resourceCreator(app, { list: { quantity: SINGLE }, items: { quantity: SINGLE, remove: false } });
      const [storedList] = creator.lists;
      const [storedItem] = creator.items;

      const result = await app.inject({
        method: 'DELETE',
        url: `/list/${storedList.id}/items/${storedItem.id}`,
        cookies: creator.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.OK);

      const itemService = app.get(ItemService);
      const remainingItems = await itemService.findAllByListId({ listId: storedList.id, user: creator.user });
      expect(remainingItems).toHaveLength(0);
    });

    it('KO - User not authenticated', async () => {
      const result = await app.inject({
        method: 'DELETE',
        url: `/list/${faker.string.uuid()}/items/${faker.string.uuid()}`,
      });

      expect(result.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('KO - Returns Not Found for non-existent resource', async () => {
      await using creator = await resourceCreator(app, { list: { quantity: SINGLE } });
      const [storedList] = creator.lists;

      const result = await app.inject({
        method: 'DELETE',
        url: `/list/${storedList.id}/items/${faker.string.uuid()}`,
        cookies: creator.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.NOT_FOUND);
    });
  });
});
