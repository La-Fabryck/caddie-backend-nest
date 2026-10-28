import { faker } from '@faker-js/faker';
import { HttpStatus } from '@nestjs/common';
import type { NestNodeApplication } from '@nestjs/platform-node';
import request from 'supertest';
import type { ErrorInterface } from '@/app.configurator';
import type { ListRow, SubscriberRow } from '@/database/database-types';
import { DatabaseService } from '@/database/database.service';
import type { ShareLinkResponse } from '@/shopping/dto/share-link-response.dto';
import { ListService } from '@/shopping/list/list.service';
import { resourceCreator } from 'test/creator/resource-creator';
import { SINGLE } from 'test/support/constants';
import { createAppE2E } from 'test/support/create-app.e2e';
import { cookieHeader } from 'test/support/http';

const INVALID_TOKEN_LENGTH = 40;
const ONE_HOUR_MS = 3_600_000;

describe('ShareLink / subscription (e2e)', () => {
  let app: NestNodeApplication;

  beforeAll(async () => {
    app = await createAppE2E();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /list/:listId/share-links', () => {
    it('OK - Creates a share link for a subscribed user', async () => {
      await using creator = await resourceCreator(app, { list: { quantity: SINGLE } });

      const result = await request(app.getHttpServer())
        .post(`/list/${creator.list.id}/share-links`)
        .set('Cookie', cookieHeader(creator.cookies));

      expect(result.status).toEqual(HttpStatus.CREATED);

      const payload = JSON.parse(result.text) as ShareLinkResponse;
      expect(payload.token.length).toBeGreaterThan(0);
      expect(payload.id).toBeDefined();
      expect(payload).not.toHaveProperty('listId');
      expect(payload).not.toHaveProperty('createdByUserId');
      expect(payload).not.toHaveProperty('createdAt');
    });

    it('KO - User not authenticated', async () => {
      const result = await request(app.getHttpServer()).post(`/list/${faker.string.uuid()}/share-links`);

      expect(result.status).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('KO - Non-subscriber cannot create a share link', async () => {
      await using owner = await resourceCreator(app, { list: { quantity: SINGLE } });
      await using stranger = await resourceCreator(app);

      const result = await request(app.getHttpServer())
        .post(`/list/${owner.list.id}/share-links`)
        .set('Cookie', cookieHeader(stranger.cookies));

      expect(result.status).toEqual(HttpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /list/:listId/share-links/:id', () => {
    it('OK - Revokes a share link', async () => {
      await using creator = await resourceCreator(app, { list: { quantity: SINGLE } });
      await using joiner = await resourceCreator(app);

      const created = await request(app.getHttpServer())
        .post(`/list/${creator.list.id}/share-links`)
        .set('Cookie', cookieHeader(creator.cookies));
      const createdLink = JSON.parse(created.text) as ShareLinkResponse;

      const result = await request(app.getHttpServer())
        .delete(`/list/${creator.list.id}/share-links/${createdLink.id}`)
        .set('Cookie', cookieHeader(creator.cookies));

      expect(result.status).toEqual(HttpStatus.OK);

      const joinResult = await request(app.getHttpServer())
        .post('/subscribers/join')
        .set('Cookie', cookieHeader(joiner.cookies))
        .send({ token: createdLink.token, name: faker.person.firstName() });
      expect(joinResult.status).toEqual(HttpStatus.NOT_FOUND);
    });
  });

  describe('POST /subscribers/join', () => {
    it('OK - Joins a list via share token', async () => {
      await using owner = await resourceCreator(app, { list: { quantity: SINGLE } });
      await using joiner = await resourceCreator(app);

      const shareResult = await request(app.getHttpServer())
        .post(`/list/${owner.list.id}/share-links`)
        .set('Cookie', cookieHeader(owner.cookies));
      const shareLink = JSON.parse(shareResult.text) as ShareLinkResponse;

      const name = faker.person.firstName();
      const joinResult = await request(app.getHttpServer())
        .post('/subscribers/join')
        .set('Cookie', cookieHeader(joiner.cookies))
        .send({ token: shareLink.token, name });

      expect(joinResult.status).toEqual(HttpStatus.CREATED);

      const subscription = JSON.parse(joinResult.text) as SubscriberRow;
      expect(subscription.listId).toEqual(owner.list.id);
      expect(subscription.userId).toEqual(joiner.user.id);
      expect(subscription.name).toEqual(name);

      const listResult = await request(app.getHttpServer()).get(`/list/${owner.list.id}`).set('Cookie', cookieHeader(joiner.cookies));
      expect(listResult.status).toEqual(HttpStatus.OK);
      expect((JSON.parse(listResult.text) as ListRow).id).toEqual(owner.list.id);
    });

    it('KO - Re-join returns conflict', async () => {
      await using owner = await resourceCreator(app, { list: { quantity: SINGLE } });
      await using joiner = await resourceCreator(app);

      const shareResult = await request(app.getHttpServer())
        .post(`/list/${owner.list.id}/share-links`)
        .set('Cookie', cookieHeader(owner.cookies));
      const shareLink = JSON.parse(shareResult.text) as ShareLinkResponse;

      const body = { token: shareLink.token, name: faker.person.firstName() };
      await request(app.getHttpServer()).post('/subscribers/join').set('Cookie', cookieHeader(joiner.cookies)).send(body);

      const result = await request(app.getHttpServer()).post('/subscribers/join').set('Cookie', cookieHeader(joiner.cookies)).send(body);

      expect(result.status).toEqual(HttpStatus.CONFLICT);
      const payload = JSON.parse(result.text) as ErrorInterface;
      expect(payload).toStrictEqual({
        token: [{ message: 'SUBSCRIBER_ALREADY_JOINED' }],
      });
    });

    it('KO - Invalid token returns not found', async () => {
      await using joiner = await resourceCreator(app);

      const result = await request(app.getHttpServer())
        .post('/subscribers/join')
        .set('Cookie', cookieHeader(joiner.cookies))
        .send({ token: faker.string.alphanumeric(INVALID_TOKEN_LENGTH), name: faker.person.firstName() });

      expect(result.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('KO - Revoked token cannot be used to join', async () => {
      await using owner = await resourceCreator(app, { list: { quantity: SINGLE } });
      await using joiner = await resourceCreator(app);

      const shareResult = await request(app.getHttpServer())
        .post(`/list/${owner.list.id}/share-links`)
        .set('Cookie', cookieHeader(owner.cookies));
      const shareLink = JSON.parse(shareResult.text) as ShareLinkResponse;

      await request(app.getHttpServer())
        .delete(`/list/${owner.list.id}/share-links/${shareLink.id}`)
        .set('Cookie', cookieHeader(owner.cookies));

      const result = await request(app.getHttpServer())
        .post('/subscribers/join')
        .set('Cookie', cookieHeader(joiner.cookies))
        .send({ token: shareLink.token, name: faker.person.firstName() });

      expect(result.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it('KO - Expired token cannot be used to join', async () => {
      await using owner = await resourceCreator(app, { list: { quantity: SINGLE } });
      await using joiner = await resourceCreator(app);

      const shareResult = await request(app.getHttpServer())
        .post(`/list/${owner.list.id}/share-links`)
        .set('Cookie', cookieHeader(owner.cookies));
      const shareLink = JSON.parse(shareResult.text) as ShareLinkResponse;

      await app
        .get(DatabaseService)
        .updateTable('ShareLink')
        .set({ expiresAt: new Date(Date.now() - ONE_HOUR_MS) })
        .where('id', '=', shareLink.id)
        .execute();

      const result = await request(app.getHttpServer())
        .post('/subscribers/join')
        .set('Cookie', cookieHeader(joiner.cookies))
        .send({ token: shareLink.token, name: faker.person.firstName() });

      expect(result.status).toEqual(HttpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /subscribers/:id', () => {
    it('OK - Leave list; last subscriber cleans up the list', async () => {
      await using creator = await resourceCreator(app, { list: { quantity: SINGLE, remove: false } });
      const subscriptionId = creator.list.subscribers[0]?.id;
      expect(subscriptionId).toBeDefined();

      const result = await request(app.getHttpServer())
        .delete(`/subscribers/${subscriptionId}`)
        .set('Cookie', cookieHeader(creator.cookies));

      expect(result.status).toEqual(HttpStatus.OK);

      const listService = app.get(ListService);
      const remaining = await listService.findListsBySubscriber({ user: creator.user, limit: 10, offset: 0 });
      expect(remaining.items).toHaveLength(0);
    });

    it('OK - Leave list while other subscribers remain', async () => {
      await using owner = await resourceCreator(app, { list: { quantity: SINGLE } });
      await using joiner = await resourceCreator(app);

      const shareResult = await request(app.getHttpServer())
        .post(`/list/${owner.list.id}/share-links`)
        .set('Cookie', cookieHeader(owner.cookies));
      const shareLink = JSON.parse(shareResult.text) as ShareLinkResponse;

      const joinResult = await request(app.getHttpServer())
        .post('/subscribers/join')
        .set('Cookie', cookieHeader(joiner.cookies))
        .send({ token: shareLink.token, name: faker.person.firstName() });
      const subscription = JSON.parse(joinResult.text) as SubscriberRow;

      const leaveResult = await request(app.getHttpServer())
        .delete(`/subscribers/${subscription.id}`)
        .set('Cookie', cookieHeader(joiner.cookies));
      expect(leaveResult.status).toEqual(HttpStatus.OK);

      const joinerList = await request(app.getHttpServer()).get(`/list/${owner.list.id}`).set('Cookie', cookieHeader(joiner.cookies));
      expect(joinerList.status).toEqual(HttpStatus.NOT_FOUND);

      const ownerList = await request(app.getHttpServer()).get(`/list/${owner.list.id}`).set('Cookie', cookieHeader(owner.cookies));
      expect(ownerList.status).toEqual(HttpStatus.OK);
    });
  });
});
