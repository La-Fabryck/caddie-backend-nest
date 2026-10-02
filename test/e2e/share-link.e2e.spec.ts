import { faker } from '@faker-js/faker';
import { HttpStatus } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { ErrorInterface } from '@/app.configurator';
import type { ListRow, SubscriberRow } from '@/database/database-types';
import { DatabaseService } from '@/database/database.service';
import type { ShareLinkResponse } from '@/shopping/dto/share-link-response.dto';
import { ListService } from '@/shopping/list/list.service';
import { resourceCreator } from 'test/creator/resource-creator';
import { SINGLE } from 'test/support/constants';
import { createAppE2E } from 'test/support/create-app.e2e';

const INVALID_TOKEN_LENGTH = 40;
const ONE_HOUR_MS = 3_600_000;

describe('ShareLink / subscription (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createAppE2E();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /list/:listId/share-links', () => {
    it('OK - Creates a share link for a subscribed user', async () => {
      await using creator = await resourceCreator(app, { list: { quantity: SINGLE } });

      const result = await app.inject({
        method: 'POST',
        url: `/list/${creator.list.id}/share-links`,
        cookies: creator.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.CREATED);

      const payload = JSON.parse(result.payload) as ShareLinkResponse;
      expect(payload.token.length).toBeGreaterThan(0);
      expect(payload.id).toBeDefined();
      expect(payload).not.toHaveProperty('listId');
      expect(payload).not.toHaveProperty('createdByUserId');
      expect(payload).not.toHaveProperty('createdAt');
    });

    it('KO - User not authenticated', async () => {
      const result = await app.inject({
        method: 'POST',
        url: `/list/${faker.string.uuid()}/share-links`,
      });

      expect(result.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('KO - Non-subscriber cannot create a share link', async () => {
      await using owner = await resourceCreator(app, { list: { quantity: SINGLE } });
      await using stranger = await resourceCreator(app);

      const result = await app.inject({
        method: 'POST',
        url: `/list/${owner.list.id}/share-links`,
        cookies: stranger.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /list/:listId/share-links/:id', () => {
    it('OK - Revokes a share link', async () => {
      await using creator = await resourceCreator(app, { list: { quantity: SINGLE } });
      await using joiner = await resourceCreator(app);

      const created = await app.inject({
        method: 'POST',
        url: `/list/${creator.list.id}/share-links`,
        cookies: creator.cookies,
      });
      const createdLink = JSON.parse(created.payload) as ShareLinkResponse;

      const result = await app.inject({
        method: 'DELETE',
        url: `/list/${creator.list.id}/share-links/${createdLink.id}`,
        cookies: creator.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.OK);

      const joinResult = await app.inject({
        method: 'POST',
        url: '/subscribers/join',
        body: { token: createdLink.token, name: faker.person.firstName() },
        cookies: joiner.cookies,
      });
      expect(joinResult.statusCode).toEqual(HttpStatus.NOT_FOUND);
    });
  });

  describe('POST /subscribers/join', () => {
    it('OK - Joins a list via share token', async () => {
      await using owner = await resourceCreator(app, { list: { quantity: SINGLE } });
      await using joiner = await resourceCreator(app);

      const shareResult = await app.inject({
        method: 'POST',
        url: `/list/${owner.list.id}/share-links`,
        cookies: owner.cookies,
      });
      const shareLink = JSON.parse(shareResult.payload) as ShareLinkResponse;

      const name = faker.person.firstName();
      const joinResult = await app.inject({
        method: 'POST',
        url: '/subscribers/join',
        body: { token: shareLink.token, name },
        cookies: joiner.cookies,
      });

      expect(joinResult.statusCode).toEqual(HttpStatus.CREATED);

      const subscription = JSON.parse(joinResult.payload) as SubscriberRow;
      expect(subscription.listId).toEqual(owner.list.id);
      expect(subscription.userId).toEqual(joiner.user.id);
      expect(subscription.name).toEqual(name);

      const listResult = await app.inject({
        method: 'GET',
        url: `/list/${owner.list.id}`,
        cookies: joiner.cookies,
      });
      expect(listResult.statusCode).toEqual(HttpStatus.OK);
      expect((JSON.parse(listResult.payload) as ListRow).id).toEqual(owner.list.id);
    });

    it('KO - Re-join returns conflict', async () => {
      await using owner = await resourceCreator(app, { list: { quantity: SINGLE } });
      await using joiner = await resourceCreator(app);

      const shareResult = await app.inject({
        method: 'POST',
        url: `/list/${owner.list.id}/share-links`,
        cookies: owner.cookies,
      });
      const shareLink = JSON.parse(shareResult.payload) as ShareLinkResponse;

      const body = { token: shareLink.token, name: faker.person.firstName() };
      await app.inject({
        method: 'POST',
        url: '/subscribers/join',
        body,
        cookies: joiner.cookies,
      });

      const result = await app.inject({
        method: 'POST',
        url: '/subscribers/join',
        body,
        cookies: joiner.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.CONFLICT);
      const payload = JSON.parse(result.payload) as ErrorInterface;
      expect(payload).toStrictEqual({
        token: [{ message: 'SUBSCRIBER_ALREADY_JOINED' }],
      });
    });

    it('KO - Invalid token returns not found', async () => {
      await using joiner = await resourceCreator(app);

      const result = await app.inject({
        method: 'POST',
        url: '/subscribers/join',
        body: { token: faker.string.alphanumeric(INVALID_TOKEN_LENGTH), name: faker.person.firstName() },
        cookies: joiner.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.NOT_FOUND);
    });

    it('KO - Revoked token cannot be used to join', async () => {
      await using owner = await resourceCreator(app, { list: { quantity: SINGLE } });
      await using joiner = await resourceCreator(app);

      const shareResult = await app.inject({
        method: 'POST',
        url: `/list/${owner.list.id}/share-links`,
        cookies: owner.cookies,
      });
      const shareLink = JSON.parse(shareResult.payload) as ShareLinkResponse;

      await app.inject({
        method: 'DELETE',
        url: `/list/${owner.list.id}/share-links/${shareLink.id}`,
        cookies: owner.cookies,
      });

      const result = await app.inject({
        method: 'POST',
        url: '/subscribers/join',
        body: { token: shareLink.token, name: faker.person.firstName() },
        cookies: joiner.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.NOT_FOUND);
    });

    it('KO - Expired token cannot be used to join', async () => {
      await using owner = await resourceCreator(app, { list: { quantity: SINGLE } });
      await using joiner = await resourceCreator(app);

      const shareResult = await app.inject({
        method: 'POST',
        url: `/list/${owner.list.id}/share-links`,
        cookies: owner.cookies,
      });
      const shareLink = JSON.parse(shareResult.payload) as ShareLinkResponse;

      await app
        .get(DatabaseService)
        .updateTable('ShareLink')
        .set({ expiresAt: new Date(Date.now() - ONE_HOUR_MS) })
        .where('id', '=', shareLink.id)
        .execute();

      const result = await app.inject({
        method: 'POST',
        url: '/subscribers/join',
        body: { token: shareLink.token, name: faker.person.firstName() },
        cookies: joiner.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /subscribers/:id', () => {
    it('OK - Leave list; last subscriber cleans up the list', async () => {
      await using creator = await resourceCreator(app, { list: { quantity: SINGLE, remove: false } });
      const subscriptionId = creator.list.subscribers[0]?.id;
      expect(subscriptionId).toBeDefined();

      const result = await app.inject({
        method: 'DELETE',
        url: `/subscribers/${subscriptionId}`,
        cookies: creator.cookies,
      });

      expect(result.statusCode).toEqual(HttpStatus.OK);

      const listService = app.get(ListService);
      const remaining = await listService.findListsBySubscriber({ user: creator.user, limit: 10, offset: 0 });
      expect(remaining.items).toHaveLength(0);
    });

    it('OK - Leave list while other subscribers remain', async () => {
      await using owner = await resourceCreator(app, { list: { quantity: SINGLE } });
      await using joiner = await resourceCreator(app);

      const shareResult = await app.inject({
        method: 'POST',
        url: `/list/${owner.list.id}/share-links`,
        cookies: owner.cookies,
      });
      const shareLink = JSON.parse(shareResult.payload) as ShareLinkResponse;

      const joinResult = await app.inject({
        method: 'POST',
        url: '/subscribers/join',
        body: { token: shareLink.token, name: faker.person.firstName() },
        cookies: joiner.cookies,
      });
      const subscription = JSON.parse(joinResult.payload) as SubscriberRow;

      const leaveResult = await app.inject({
        method: 'DELETE',
        url: `/subscribers/${subscription.id}`,
        cookies: joiner.cookies,
      });
      expect(leaveResult.statusCode).toEqual(HttpStatus.OK);

      const joinerList = await app.inject({
        method: 'GET',
        url: `/list/${owner.list.id}`,
        cookies: joiner.cookies,
      });
      expect(joinerList.statusCode).toEqual(HttpStatus.NOT_FOUND);

      const ownerList = await app.inject({
        method: 'GET',
        url: `/list/${owner.list.id}`,
        cookies: owner.cookies,
      });
      expect(ownerList.statusCode).toEqual(HttpStatus.OK);
    });
  });
});
