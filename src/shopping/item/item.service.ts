import { Injectable, NotFoundException } from '@nestjs/common';
import { Item, User } from '@prisma/client';
import { DatabaseService } from '@/database/database.service';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { ListService } from '../list/list.service';

type CreateItem = {
  createItemPayload: CreateItemDto & Pick<Item, 'listId'>;
  user: User;
};

type UpdateItem = {
  updateItemPayload: UpdateItemDto & Pick<Item, 'listId' | 'id'>;
  user: User;
};

type FindItems = { listId: string; user: User };

@Injectable()
export class ItemService {
  constructor(
    private database: DatabaseService,
    private readonly listService: ListService,
  ) {}

  async create({ createItemPayload, user }: CreateItem): Promise<Item> {
    // verify that the list exist
    await this.listService.findOneById({
      id: createItemPayload.listId,
      user,
    });

    return this.database.$transaction(async (transaction) => {
      await this.listService.updateDate(createItemPayload.listId, transaction);

      return transaction.item.create({
        data: createItemPayload,
      });
    });
  }

  async findAllByListId({ listId, user }: FindItems) {
    // verify that the list exist
    await this.listService.findOneById({
      id: listId,
      user,
    });

    return this.database.item.findMany({
      where: {
        listId,
      },
    });
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.database.item.findUnique({
      where: {
        id,
      },
    });

    if (item == null) {
      throw new NotFoundException();
    }

    return item;
  }

  async update({ updateItemPayload, user }: UpdateItem): Promise<Item> {
    await this.listService.findOneById({
      id: updateItemPayload.listId,
      user,
    });

    return this.database.$transaction(async (transaction) => {
      await this.listService.updateDate(updateItemPayload.listId, transaction);

      return transaction.item.update({
        data: {
          // eslint-disable-next-line @typescript-eslint/no-misused-spread
          ...updateItemPayload,
        },
        where: {
          id: updateItemPayload.id,
        },
      });
    });
  }

  //TODO: Implement

  async remove(listId: string, itemId: string, user: User) {
    await this.listService.findOneById({
      id: listId,
      user,
    });

    await this.database.$transaction(async (transaction) => {
      await this.listService.updateDate(listId, transaction);

      await transaction.item.delete({
        where: {
          id: itemId,
        },
      });
    });
  }
}
