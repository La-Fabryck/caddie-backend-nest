import { Injectable, NotFoundException } from '@nestjs/common';
import { List } from '@prisma/client';
import { CreateListDto } from '../dto/create-list.dto';
import { UpdateListDto } from '../dto/update-list.dto';
import { DatabaseService } from '@/database/database.service';

@Injectable()
export class ListService {
  constructor(private database: DatabaseService) {}

  create(createListDto: CreateListDto) {
    return this.database.list.create({
      data: createListDto,
    });
  }

  findAll(authorId: string) {
    return this.database.list.findMany({
      where: {
        authorId,
      },
    });
  }

  async findOne(id: string): Promise<List> {
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

  update(id: number, updateListDto: UpdateListDto) {
    return `This action updates a #${id} shopping ${updateListDto.authorId}`;
  }

  remove(id: number) {
    return `This action removes a #${id} shopping`;
  }
}
