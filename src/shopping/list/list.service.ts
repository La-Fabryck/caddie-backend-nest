import { Injectable, NotFoundException } from '@nestjs/common';
import type { List, Prisma, Subscriber, User } from '@prisma/client';
import { DatabaseService } from '@/database/database.service';
import { CreateListDto } from '../dto/create-list.dto';
import { SubscribersService } from '../subscriber/subscribers.service';

export type CreateList = CreateListDto & { user: User };

type UpdateListPayload = Pick<List, 'id'> & Partial<Pick<List, 'title'>>;
type UpdateList = { payload: UpdateListPayload; user: User };

type RemoveList = { id: string; user: User };

export type ListWithSubs = List & { subscribers: Subscriber[] };

@Injectable()
export class ListService {
  constructor(
    private database: DatabaseService,
    private readonly subscribersService: SubscribersService,
  ) {}

  async create({ user, pseudonym, title }: CreateList): Promise<ListWithSubs> {
    return this.database.$transaction(async (transaction) => {
      const list: List = await transaction.list.create({
        data: { title },
      });

      const subscriber = await this.subscribersService.create(
        {
          listId: list.id,
          user,
          name: pseudonym,
        },
        transaction,
      );

      return { ...list, subscribers: [subscriber] };
    });
  }

  async update({ payload, user }: UpdateList): Promise<List> {
    await this.findOneById({ id: payload.id, user });
    return this.database.list.update({
      data: payload,
      where: {
        id: payload.id,
      },
    });
  }

  async remove({ id, user }: RemoveList) {
    await this.findOneById({ id, user });

    await this.database.$transaction(async (transaction) => {
      await Promise.all([
        transaction.item.deleteMany({
          where: {
            listId: id,
          },
        }),
        transaction.subscriber.deleteMany({
          where: {
            listId: id,
          },
        }),
      ]);

      await transaction.list.delete({
        where: {
          id,
        },
      });
    });
  }

  async findListsBySubscriber({ user }: { user: User }): Promise<List[]> {
    const subscriptions = await this.subscribersService.findAllByUser({ user });

    return this.database.list.findMany({
      where: {
        id: {
          in: subscriptions.map((sub) => sub.listId),
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  /**
   * This method checks that the user is subscribed to the list and that the lists exists
   * If it exists, returns it
   * If it doesn't, throw a NotFoundException
   */
  async findOneById({ id, user }: { id: string; user: User }): Promise<List> {
    //Check if the user is subscribed to the list, else throws a NotFoundException
    await this.subscribersService.findOne({
      listId: id,
      user,
    });

    const list = await this.database.list.findUnique({
      where: {
        id,
      },
    });

    if (list == null) {
      throw new NotFoundException();
    }

    return list;
  }

  async updateDate(id: string, tx: Prisma.TransactionClient) {
    return tx.list.update({
      where: {
        id,
      },
      data: {
        updatedAt: new Date(),
      },
    });
  }
}
