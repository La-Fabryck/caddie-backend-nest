import { Injectable, NotFoundException } from '@nestjs/common';
import { type List, Prisma, type Subscriber, type User } from '@prisma/client';
import { DatabaseService } from '@/database/database.service';
import { CreateListDto } from '../dto/create-list.dto';
import { UpdateListDto } from '../dto/update-list.dto';
import { SubscribersService } from '../subscriber/subscribers.service';

type CreateList = CreateListDto & { user: User };
export type ListWithSubs = List & { subscribers: Subscriber[] };

@Injectable()
export class ListService {
  constructor(
    private database: DatabaseService,
    private readonly subscribersService: SubscribersService,
  ) {}

  async createList({ user, pseudonym, title }: CreateList): Promise<ListWithSubs> {
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

  //TODO: Implement
  update(id: string, updateListDto: UpdateListDto) {
    console.log(updateListDto.title);
    return `This action updates a #${id} shopping}`;
  }

  //TODO: Implement
  remove(id: string) {
    return `This action removes a #${id} shopping`;
  }
}
