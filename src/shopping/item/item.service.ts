import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Item, User } from '@prisma/client';
import { UpdateItemDto } from '../dto/update-item.dto';
import { CreateItemDto } from '../dto/create-item.dto';
import { ListService } from '../list/list.service';
import { DatabaseService } from '@/database/database.service';

type CreateItem = {
  createItemDto: CreateItemDto;
  user: User;
};

type FindItems = { listId: string; user: User };

@Injectable()
export class ItemService {
  constructor(
    private database: DatabaseService,
    private readonly listService: ListService,
  ) {}

  async create(createItem: CreateItem) {
    const list = await this.listService.findOneById({
      id: createItem.createItemDto.listId,
      authorId: createItem.user.id,
    });

    if (list == null) {
      throw new ForbiddenException();
    }

    return this.database.item.create({
      data: createItem.createItemDto,
    });
  }

  async findAllByListId({ listId, user }: FindItems) {
    const list = await this.listService.findOneById({
      id: listId,
      authorId: user.id,
    });

    if (list == null) {
      throw new ForbiddenException();
    }

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

  update(id: number, _updateItemDto: UpdateItemDto) {
    console.log(id, _updateItemDto);
    throw new Error('Method not implemented.');
  }

  remove(id: number) {
    console.log(id);
    throw new Error('Method not implemented.');
  }
}
