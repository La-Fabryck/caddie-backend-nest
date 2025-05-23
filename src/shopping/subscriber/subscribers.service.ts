import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Subscriber, User } from '@prisma/client';
import { DatabaseService } from '@/database/database.service';
import { CreateSubcriberDto } from '../dto/create-subcriber.dto';
import { UpdateSubcriberDto } from '../dto/update-subcriber.dto';

type CreateSubcriber = CreateSubcriberDto & { user: User };

@Injectable()
export class SubscribersService {
  constructor(private database: DatabaseService) {}

  async create({ listId, name, user }: CreateSubcriber, tx: Prisma.TransactionClient) {
    //TODO: validate ?
    // try {
    //   await this.listService.findOneById({
    //     id: listId,
    //   });
    // } catch (ex) {
    //   if (ex instanceof NotFoundException) {
    //     throw new ForbiddenException();
    //   }
    // }

    return tx.subscriber.create({
      data: {
        name,
        listId,
        userId: user.id,
      },
    });
  }

  async findAllByUser({ user }: { user: User }): Promise<Subscriber[]> {
    return this.database.subscriber.findMany({
      where: {
        userId: user.id,
      },
    });
  }

  async findOneById({ id, user }: { id: string; user: User }) {
    const subscription = await this.database.subscriber.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (subscription == null) {
      throw new NotFoundException();
    }

    return subscription;
  }

  async findOne({ listId, user }: { listId: string; user: User }) {
    const subscription = await this.database.subscriber.findFirst({
      where: {
        listId,
        userId: user.id,
      },
    });

    if (subscription == null) {
      throw new NotFoundException();
    }

    return subscription;
  }

  //TODO: Implement

  update(id: string, updateSubcriberDto: UpdateSubcriberDto) {
    console.log(updateSubcriberDto.listId);
    return `This action updates a #${id} subcriber`;
  }

  //TODO: Implement

  remove(id: string) {
    return `This action removes a #${id} subcriber`;
  }
}
