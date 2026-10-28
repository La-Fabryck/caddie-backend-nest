import { faker } from '@faker-js/faker';
import { HttpStatus } from '@nestjs/common';
import type { NestNodeApplication } from '@nestjs/platform-node';
import request from 'supertest';
import type { ErrorInterface } from '@/app.configurator';
import type { ListRow } from '@/database/database-types';
import { type CreateListDto, LIST_TITLE_MAX_LENGTH } from '@/shopping/dto/create-list.dto';
import { DEFAULT_LIST_LIMIT } from '@/shopping/dto/list-pagination.dto';
import type { UpdateListDto } from '@/shopping/dto/update-list.dto';
import { ListService, type ListWithSubs } from '@/shopping/list/list.service';
import { resourceCreator } from 'test/creator/resource-creator';
import { SINGLE } from 'test/support/constants';
import { createAppE2E } from 'test/support/create-app.e2e';
import { cookieHeader } from 'test/support/http';

describe('ListController (e2e)', () => {
  let app: NestNodeApplication;

  beforeAll(async () => {
    app = await createAppE2E();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/list (POST)', () => {
    it('OK - Creates a list', async () => {
      await using creator = await resourceCreator(app);

      const list: CreateListDto = {
        title: faker.food.dish().slice(0, LIST_TITLE_MAX_LENGTH),
        pseudonym: faker.person.firstName(),
      };

      const result = await request(app.getHttpServer()).post('/list').set('Cookie', cookieHeader(creator.cookies)).send(list);
      expect(result.status).toEqual(HttpStatus.CREATED);

      const payload = JSON.parse(result.text) as ListWithSubs;
      expect(payload.title).toEqual(list.title);
      expect(payload.isArchived).toBe(false);
      expect(payload.subscribers.some((subscriber) => subscriber.name)).toBeTruthy();

      await app.get(ListService).remove({ id: payload.id, user: creator.user });
    });

    it('KO - User not authenticated', async () => {
      const result = await request(app.getHttpServer()).post('/list').send({});

      expect(result.status).toEqual(HttpStatus.UNAUTHORIZED);

      const payload = JSON.parse(result.text) as ErrorInterface;
      expect(payload).toStrictEqual({ root: [{ message: 'INVALID_TOKEN' }] });
    });

    it('KO - Fails validation', async () => {
      await using creator = await resourceCreator(app);

      const result = await request(app.getHttpServer()).post('/list').set('Cookie', cookieHeader(creator.cookies)).send({});
      expect(result.status).toEqual(HttpStatus.BAD_REQUEST);

      const payload = JSON.parse(result.text) as ErrorInterface;
      expect(payload).toStrictEqual({
        title: [{ message: 'LIST_TITLE' }],
        pseudonym: [{ message: 'LIST_PSEUDONYM' }],
      });
    });
  });

  describe('/list (GET)', () => {
    it('OK - Finds list from a User', async () => {
      await using creator = await resourceCreator(app, { list: { quantity: SINGLE } });

      const result = await request(app.getHttpServer()).get('/list').set('Cookie', cookieHeader(creator.cookies));

      expect(result.status).toEqual(HttpStatus.OK);

      const payload = JSON.parse(result.text) as { items: ListRow[]; total: number; limit: number; offset: number };
      expect(payload.limit).toBe(DEFAULT_LIST_LIMIT);
      expect(payload.offset).toBe(0);
      expect(payload.total).toBeGreaterThanOrEqual(SINGLE);
      expect(payload.items).not.toHaveLength(0);
      for (const expectedList of payload.items) {
        const storedList = creator.lists.find((list) => list.id === expectedList.id);
        expect(storedList).not.toBeNull();
        expect(expectedList.title).toEqual(storedList?.title);
        expect(expectedList.isArchived).toBe(false);
      }
    });

    it('OK - Paginates lists', async () => {
      const pageSize = 10;
      const extraItems = 2;
      await using creator = await resourceCreator(app, { list: { quantity: pageSize + extraItems } });

      const firstPage = await request(app.getHttpServer())
        .get(`/list?limit=${pageSize}&offset=0`)
        .set('Cookie', cookieHeader(creator.cookies));
      expect(firstPage.status).toEqual(HttpStatus.OK);

      const firstPayload = JSON.parse(firstPage.text) as { items: ListRow[]; total: number; limit: number; offset: number };
      expect(firstPayload.limit).toBe(pageSize);
      expect(firstPayload.offset).toBe(0);
      expect(firstPayload.total).toBeGreaterThanOrEqual(pageSize + extraItems);
      expect(firstPayload.items).toHaveLength(pageSize);

      const secondPage = await request(app.getHttpServer())
        .get(`/list?limit=${pageSize}&offset=${pageSize}`)
        .set('Cookie', cookieHeader(creator.cookies));
      expect(secondPage.status).toEqual(HttpStatus.OK);

      const secondPayload = JSON.parse(secondPage.text) as { items: ListRow[]; total: number; limit: number; offset: number };
      expect(secondPayload.items.length).toBeGreaterThanOrEqual(extraItems);
      const firstPageIds = new Set(firstPayload.items.map((list) => list.id));
      expect(secondPayload.items.every((list) => !firstPageIds.has(list.id))).toBe(true);
    });

    it('KO - User not authenticated', async () => {
      const result = await request(app.getHttpServer()).get('/list');

      expect(result.status).toEqual(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('/list/:id (GET)', () => {
    it('OK - Finds a list by its id', async () => {
      await using creator = await resourceCreator(app, { list: { quantity: SINGLE } });
      const storedList = creator.list;

      const result = await request(app.getHttpServer()).get(`/list/${storedList.id}`).set('Cookie', cookieHeader(creator.cookies));

      expect(result.status).toEqual(HttpStatus.OK);

      const payload = JSON.parse(result.text) as ListRow;
      expect(payload.title).toEqual(storedList.title);
      expect(payload.isArchived).toBe(false);
    });

    it('KO - Requires to be authenticated', async () => {
      const result = await request(app.getHttpServer()).get(`/list/${faker.string.uuid()}`);

      expect(result.status).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('KO - Returns Not Found for non-existent resource', async () => {
      await using creator = await resourceCreator(app);

      const result = await request(app.getHttpServer()).get(`/list/${faker.string.uuid()}`).set('Cookie', cookieHeader(creator.cookies));

      expect(result.status).toEqual(HttpStatus.NOT_FOUND);
    });
  });

  describe('/list/:id (PATCH)', () => {
    it('OK - Update a list', async () => {
      await using creator = await resourceCreator(app, { list: { quantity: SINGLE } });
      const storedList = creator.list;

      const updatePayload: UpdateListDto = {
        title: faker.food.dish().slice(0, LIST_TITLE_MAX_LENGTH),
      };

      const result = await request(app.getHttpServer())
        .patch(`/list/${storedList.id}`)
        .set('Cookie', cookieHeader(creator.cookies))
        .send(updatePayload);

      expect(result.status).toEqual(HttpStatus.OK);

      const payload = JSON.parse(result.text) as ListRow;
      expect(payload.title).toEqual(updatePayload.title);
    });

    it('OK - Archive and unarchive a list', async () => {
      await using creator = await resourceCreator(app, { list: { quantity: SINGLE } });
      const storedList = creator.list;

      const archiveResult = await request(app.getHttpServer())
        .patch(`/list/${storedList.id}`)
        .set('Cookie', cookieHeader(creator.cookies))
        .send({ isArchived: true } satisfies UpdateListDto);

      expect(archiveResult.status).toEqual(HttpStatus.OK);
      expect((JSON.parse(archiveResult.text) as ListRow).isArchived).toBe(true);

      const unarchiveResult = await request(app.getHttpServer())
        .patch(`/list/${storedList.id}`)
        .set('Cookie', cookieHeader(creator.cookies))
        .send({ isArchived: false } satisfies UpdateListDto);

      expect(unarchiveResult.status).toEqual(HttpStatus.OK);
      expect((JSON.parse(unarchiveResult.text) as ListRow).isArchived).toBe(false);
    });

    it('KO - User not authenticated', async () => {
      const result = await request(app.getHttpServer()).patch(`/list/${faker.string.uuid()}`).send({});

      expect(result.status).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('KO - Returns Not Found for non-existent resource', async () => {
      await using creator = await resourceCreator(app);

      const result = await request(app.getHttpServer()).patch(`/list/${faker.string.uuid()}`).set('Cookie', cookieHeader(creator.cookies));

      expect(result.status).toEqual(HttpStatus.NOT_FOUND);
    });
  });

  describe('/list/:id (DELETE)', () => {
    it('OK - Delete a list', async () => {
      await using creator = await resourceCreator(app, { list: { quantity: SINGLE, remove: false } });
      const storedList = creator.list;

      const result = await request(app.getHttpServer()).delete(`/list/${storedList.id}`).set('Cookie', cookieHeader(creator.cookies));

      expect(result.status).toEqual(HttpStatus.OK);

      const listService = app.get(ListService);
      const remainingLists = await listService.findListsBySubscriber({ user: creator.user, limit: 10, offset: 0 });
      expect(remainingLists.items).toHaveLength(0);
    });

    it('KO - User not authenticated', async () => {
      const result = await request(app.getHttpServer()).delete(`/list/${faker.string.uuid()}`);

      expect(result.status).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('KO - Returns Not Found for non-existent resource', async () => {
      await using creator = await resourceCreator(app);

      const result = await request(app.getHttpServer()).delete(`/list/${faker.string.uuid()}`).set('Cookie', cookieHeader(creator.cookies));

      expect(result.status).toEqual(HttpStatus.NOT_FOUND);
    });
  });
});
