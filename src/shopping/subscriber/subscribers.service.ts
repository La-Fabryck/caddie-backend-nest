import { Injectable, NotFoundException } from '@nestjs/common';
import type { Kysely } from 'kysely';
import type { DB, SubscriberRow, UserRow } from '@/database/database-types';
import { DatabaseService } from '@/database/database.service';
import { CreateSubcriberDto } from '../dto/create-subcriber.dto';
import { UpdateSubcriberDto } from '../dto/update-subcriber.dto';

type CreateSubcriber = CreateSubcriberDto & { user: UserRow };

@Injectable()
export class SubscribersService {
  constructor(private readonly database: DatabaseService) {}

  async create({ listId, name, user }: CreateSubcriber, tx: Kysely<DB>): Promise<SubscriberRow> {
    //TODO: Check if the subscriber already exists. What validation should we do?
    const row = await tx
      .insertInto('Subscriber')
      .values({
        listId,
        userId: user.id,
        name,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return row;
  }

  async findAllByUser({ user }: { user: UserRow }): Promise<SubscriberRow[]> {
    return this.database.selectFrom('Subscriber').where('userId', '=', user.id).selectAll().execute();
  }

  async findOneById({ id, user }: { id: string; user: UserRow }): Promise<SubscriberRow> {
    const subscription = await this.database
      .selectFrom('Subscriber')
      .where('id', '=', id)
      .where('userId', '=', user.id)
      .selectAll()
      .executeTakeFirst();

    if (subscription == null) {
      throw new NotFoundException();
    }

    return subscription;
  }

  async findOne({ listId, user }: { listId: string; user: UserRow }): Promise<SubscriberRow> {
    const subscription = await this.database
      .selectFrom('Subscriber')
      .where('listId', '=', listId)
      .where('userId', '=', user.id)
      .selectAll()
      .executeTakeFirst();

    if (subscription == null) {
      throw new NotFoundException();
    }

    return subscription;
  }

  //TODO: Implement
  update(id: string, updateSubcriberDto: UpdateSubcriberDto): string {
    console.log(updateSubcriberDto.listId);
    return `This action updates a #${id} subcriber`;
  }

  //TODO: Implement
  remove(id: string): string {
    return `This action removes a #${id} subcriber`;
  }
}
