import { Injectable, NotFoundException } from '@nestjs/common';
import type { Kysely } from 'kysely';
import type { DB, ListRow, SubscriberRow, UserRow } from '@/database/database-types';
import { DatabaseService } from '@/database/database.service';
import { CreateListDto } from '../dto/create-list.dto';
import { SubscribersService } from '../subscriber/subscribers.service';

export type CreateList = CreateListDto & { user: UserRow };

type UpdateListPayload = Pick<ListRow, 'id'> & Partial<Pick<ListRow, 'title'>>;
type UpdateList = { payload: UpdateListPayload; user: UserRow };

type RemoveList = { id: string; user: UserRow };

export type ListWithSubs = ListRow & { subscribers: SubscriberRow[] };

@Injectable()
export class ListService {
  constructor(
    private readonly database: DatabaseService,
    private readonly subscribersService: SubscribersService,
  ) {}

  async create({ user, pseudonym, title }: CreateList): Promise<ListWithSubs> {
    return this.database.transaction().execute(async (trx) => {
      const listRow = await trx
        .insertInto('List')
        .values({
          title,
          updatedAt: new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const subscriber = await this.subscribersService.create(
        {
          listId: listRow.id,
          user,
          name: pseudonym,
        },
        trx,
      );

      return { ...listRow, subscribers: [subscriber] };
    });
  }

  async update({ payload, user }: UpdateList): Promise<ListRow> {
    await this.findOneById({ id: payload.id, user });

    return this.database.updateTable('List').set(payload).where('id', '=', payload.id).returningAll().executeTakeFirstOrThrow();
  }

  async remove({ id, user }: RemoveList): Promise<void> {
    await this.findOneById({ id, user });

    await this.database.transaction().execute(async (trx) => {
      await trx.deleteFrom('Item').where('listId', '=', id).execute();
      await trx.deleteFrom('Subscriber').where('listId', '=', id).execute();
      await trx.deleteFrom('List').where('id', '=', id).execute();
    });
  }

  async findListsBySubscriber({ user }: { user: UserRow }): Promise<ListRow[]> {
    const subscriptions = await this.subscribersService.findAllByUser({ user });

    const listIds = subscriptions.map((sub) => sub.listId);
    if (listIds.length === 0) return [];

    return this.database.selectFrom('List').where('id', 'in', listIds).orderBy('updatedAt', 'desc').selectAll().execute();
  }

  /**
   * This method checks that the user is subscribed to the list and that the lists exists
   * If it exists, returns it
   * If it doesn't, throw a NotFoundException
   */
  async findOneById({ id, user }: { id: string; user: UserRow }): Promise<ListRow> {
    await this.subscribersService.findOne({
      listId: id,
      user,
    });

    const list = await this.database.selectFrom('List').where('id', '=', id).selectAll().executeTakeFirst();

    if (list == null) {
      throw new NotFoundException();
    }

    return list;
  }

  async updateDate(id: string, tx: Kysely<DB>): Promise<void> {
    await tx.updateTable('List').set({ updatedAt: new Date() }).where('id', '=', id).execute();
  }
}
