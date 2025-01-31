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

type FindItems = { listId: string; user: User };

@Injectable()
export class ItemService {
  constructor(
    private database: DatabaseService,
    private readonly listService: ListService,
  ) {}

  async create({ createItemPayload }: CreateItem) {
    // verify that the list exist
    await this.listService.findOneById({
      id: createItemPayload.listId,
    });

    await this.listService.updateDate(createItemPayload.listId);

    return this.database.item.create({
      data: createItemPayload,
    });
  }

  async findAllByListId({ listId }: FindItems) {
    // verify that the list exist
    await this.listService.findOneById({
      id: listId,
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

  //TODO: Implement
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  update(id: string, _updateItemDto: UpdateItemDto) {
    console.log(id, _updateItemDto);
    throw new Error('Method not implemented.');
  }

  //TODO: Implement
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  remove(id: string) {
    console.log(id);
    throw new Error('Method not implemented.');
  }
}
