import { Injectable, NotFoundException } from '@nestjs/common';
import { type List, type Subscriber, type User } from '@prisma/client';
import { DatabaseService } from '@/database/database.service';
import { CreateListDto } from '../dto/create-list.dto';
import { UpdateListDto } from '../dto/update-list.dto';
import { SubscribersService } from '../subscriber/subscribers.service';

type CreateList = CreateListDto & { user: User };
type FindListById = Pick<List, 'id'>;
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

  findAllById(ids: string[]): Promise<List[]> {
    return this.database.list.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async findOneById(findListById: FindListById): Promise<List> {
    const list = await this.database.list.findUnique({
      where: findListById,
    });

    if (list == null) {
      throw new NotFoundException();
    }

    return list;
  }

  async findListsBySubscriber({ user }: { user: User }): Promise<List[]> {
    const subscriptions = await this.subscribersService.findAllByUser({ user });
    const lists = await this.findAllById(subscriptions.map((sub) => sub.listId));

    return lists;
  }

  async findOneListById({ id, user }: { id: string; user: User }): Promise<List> {
    //Check if the user is subscribed to the list, else throws a NotFoundException
    await this.subscribersService.findOne({
      listId: id,
      user,
    });

    return this.findOneById({ id });
  }

  updateDate(id: string) {
    return this.database.list.update({
      where: {
        id,
      },
      data: {
        updatedAt: new Date(),
      },
    });
  }

  update(id: number, updateListDto: UpdateListDto) {
    console.log(updateListDto.title);
    return `This action updates a #${id} shopping}`;
  }

  remove(id: number) {
    return `This action removes a #${id} shopping`;
  }
}
