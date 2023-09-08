import { Injectable, NotFoundException } from '@nestjs/common';
import { List } from '@prisma/client';
import { UpdateListDto } from '../dto/update-list.dto';
import { DatabaseService } from '@/database/database.service';

type CreateList = Omit<List, 'id'>;
type FindListById = Pick<List, 'id'>;

@Injectable()
export class ListService {
  constructor(private database: DatabaseService) {}

  create(createList: CreateList): Promise<List> {
    //TODO: with or without ?
    // return this.database.list.create({
    //   data: createList,
    // });

    return this.database.list.create({
      data: createList,
      include: {
        subscribers: true,
      },
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

  update(id: number, updateListDto: UpdateListDto) {
    console.log(updateListDto.title);
    return `This action updates a #${id} shopping}`;
  }

  remove(id: number) {
    return `This action removes a #${id} shopping`;
  }
}
