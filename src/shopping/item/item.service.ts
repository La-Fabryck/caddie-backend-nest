import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Item } from '@prisma/client';
import { UpdateItemDto } from '../dto/update-item.dto';
import { CreateItemDto } from '../dto/create-item.dto';
import { DatabaseService } from '@/database/database.service';

@Injectable()
export class ItemService {
  constructor(private database: DatabaseService) {}

  async create(createItemDto: CreateItemDto) {
    const listExists = await this.database.item.count({
      where: {
        listId: createItemDto.listId,
      },
    });

    if (!listExists) {
      throw new ForbiddenException();
    }

    return this.database.item.create({
      data: createItemDto,
    });
  }

  findAll(listId: string) {
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
