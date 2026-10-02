import { ConflictException, Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import type { Kysely } from 'kysely';
import type { DB, SubscriberRow, UserRow } from '@/database/database-types';
import { DatabaseService } from '@/database/database.service';
import type { CreateSubcriberDto } from '../dto/create-subcriber.dto';
import type { JoinByShareLinkDto } from '../dto/join-by-share-link.dto';
import type { UpdateSubcriberDto } from '../dto/update-subcriber.dto';
import { SUBSCRIBER_ALREADY_JOINED } from '../messages/subscriber';

type CreateSubcriber = CreateSubcriberDto & { user: UserRow };

@Injectable()
export class SubscribersService {
  constructor(private readonly database: DatabaseService) {}

  async create({ listId, name, user }: CreateSubcriber, tx: Kysely<DB>): Promise<SubscriberRow> {
    const row = await tx
      .insertInto('Subscriber')
      .values({
        listId,
        userId: user.id,
        name,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return row;
  }

  async joinByShareLink({ token, name, user }: JoinByShareLinkDto & { user: UserRow }): Promise<SubscriberRow> {
    const shareLink = await this.database
      .selectFrom('ShareLink')
      .where('token', '=', token)
      .where('expiresAt', '>', new Date())
      .selectAll()
      .executeTakeFirst();

    if (shareLink == null) {
      throw new NotFoundException();
    }

    const existing = await this.database
      .selectFrom('Subscriber')
      .where('listId', '=', shareLink.listId)
      .where('userId', '=', user.id)
      .selectAll()
      .executeTakeFirst();

    if (existing != null) {
      throw new ConflictException({
        token: [{ message: SUBSCRIBER_ALREADY_JOINED }],
      });
    }

    return this.database.transaction().execute(async (trx) => {
      return this.create({ listId: shareLink.listId, name, user }, trx);
    });
  }

  async findAllByUser({ user }: { user: UserRow }): Promise<SubscriberRow[]> {
    return this.database.selectFrom('Subscriber').where('userId', '=', user.id).selectAll().execute();
  }

  async findOneById({ id, user }: { id: string; user: UserRow }): Promise<SubscriberRow> {
    const subscription = await this.database
      .selectFrom('Subscriber')
      .where('id', '=', id)
      .where('userId', '=', user.id)
      .selectAll()
      .executeTakeFirst();

    if (subscription == null) {
      throw new NotFoundException();
    }

    return subscription;
  }

  async findOne({ listId, user }: { listId: string; user: UserRow }): Promise<SubscriberRow> {
    const subscription = await this.database
      .selectFrom('Subscriber')
      .where('listId', '=', listId)
      .where('userId', '=', user.id)
      .selectAll()
      .executeTakeFirst();

    if (subscription == null) {
      throw new NotFoundException();
    }

    return subscription;
  }

  update(_id: string, _updateSubcriberDto: UpdateSubcriberDto): never {
    throw new NotImplementedException();
  }

  async remove({ id, user }: { id: string; user: UserRow }): Promise<void> {
    const subscription = await this.findOneById({ id, user });

    await this.database.transaction().execute(async (trx) => {
      await trx.deleteFrom('Subscriber').where('id', '=', subscription.id).execute();

      const remaining = await trx
        .selectFrom('Subscriber')
        .where('listId', '=', subscription.listId)
        .select((eb) => eb.fn.countAll<string>().as('count'))
        .executeTakeFirstOrThrow();

      if (Number(remaining.count) === 0) {
        await trx.deleteFrom('Item').where('listId', '=', subscription.listId).execute();
        // ShareLink rows cascade when List is deleted (FK onDelete cascade).
        await trx.deleteFrom('List').where('id', '=', subscription.listId).execute();
      }
    });
  }
}
