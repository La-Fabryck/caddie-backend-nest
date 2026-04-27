import { Injectable, NotFoundException } from '@nestjs/common';
import type { Insertable, Updateable } from 'kysely';
import type { ItemType, ItemTypeRow, UserRow } from '@/database/database-types';
import { DatabaseService } from '@/database/database.service';
import { CreateItemTypeDto } from '../dto/create-item-type.dto';
import { UpdateItemTypeDto } from '../dto/update-item-type.dto';

@Injectable()
export class ItemTypeService {
  constructor(private readonly database: DatabaseService) {}

  async create(payload: CreateItemTypeDto, user: UserRow): Promise<ItemTypeRow> {
    const itemType: Insertable<ItemType> = {
      label: payload.label,
      userId: user.id,
    };

    return this.database.insertInto('ItemType').values(itemType).returningAll().executeTakeFirstOrThrow();
  }

  async findAllByUser(user: UserRow): Promise<ItemTypeRow[]> {
    return this.database
      .selectFrom('ItemType')
      .where('userId', '=', user.id)
      .selectAll()
      .orderBy((eb) => eb.fn('lower', ['label']), 'asc')
      .execute();
  }

  async findOneById(id: string, user: UserRow): Promise<ItemTypeRow> {
    const itemType = await this.database
      .selectFrom('ItemType')
      .where('id', '=', id)
      .where('userId', '=', user.id)
      .selectAll()
      .executeTakeFirst();

    if (itemType == null) {
      throw new NotFoundException();
    }

    return itemType;
  }

  async findOneByIdForUser({ id, user }: { id: string; user: UserRow }): Promise<ItemTypeRow> {
    const itemType = await this.database
      .selectFrom('ItemType')
      .where('id', '=', id)
      .where('userId', '=', user.id)
      .selectAll()
      .executeTakeFirst();

    if (itemType == null) {
      throw new NotFoundException();
    }

    return itemType;
  }

  async update(id: string, payload: UpdateItemTypeDto, user: UserRow): Promise<ItemTypeRow> {
    await this.findOneById(id, user);

    const itemType: Updateable<ItemType> = {
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      ...payload,
    };

    return this.database
      .updateTable('ItemType')
      .set(itemType)
      .where('id', '=', id)
      .where('userId', '=', user.id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async remove(id: string, user: UserRow): Promise<void> {
    await this.findOneById(id, user);
    await this.database.deleteFrom('ItemType').where('id', '=', id).where('userId', '=', user.id).execute();
  }
}
