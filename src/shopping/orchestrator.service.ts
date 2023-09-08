import { Injectable } from '@nestjs/common';
import { List, Subscriber, User } from '@prisma/client';
import { SubscribersService } from './subscriber/subscribers.service';
import { ListService } from '@/shopping/list/list.service';
import { CreateListDto } from '@/shopping/dto/create-list.dto';

export type ListWithSubs = List & { subscribers: Subscriber[] };
type CreateList = CreateListDto & { user: User };

/**
 * Centralize the creation of Lists and Subs
 * to avoid circular dependencies
 *
 */
@Injectable()
export class OrchestratorService {
  constructor(
    private readonly subscribersService: SubscribersService,
    private readonly listService: ListService,
  ) {}

  async createList({
    user,
    pseudonym,
    title,
  }: CreateList): Promise<ListWithSubs> {
    const list: ListWithSubs = {
      ...(await this.listService.create({
        title,
      })),
      subscribers: [],
    };

    const subs = await this.subscribersService.create({
      listId: list.id,
      user,
      name: pseudonym,
    });

    list.subscribers.push(subs);

    return list;
  }

  async findListsBySubscriber({ user }: { user: User }): Promise<List[]> {
    const subscriptions = await this.subscribersService.findAllByUser({ user });
    const lists = await this.listService.findAllById(
      subscriptions.map((sub) => sub.listId),
    );

    return lists;
  }

  //TODO: Add subs ?
  async findOneListById({
    id,
    user,
  }: {
    id: string;
    user: User;
  }): Promise<List> {
    //Check if the user is subscribed to the list, else throws a NotFoundException
    await this.subscribersService.findOne({
      listId: id,
      user,
    });

    return this.listService.findOneById({ id });
  }
}
