import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import type { Insertable, Updateable } from 'kysely';
import type { ItemType, ItemTypeRow, UserRow } from '@/database/database-types';
import { DatabaseService } from '@/database/database.service';
import type { CreateItemTypeDto } from '../dto/create-item-type.dto';
import type { UpdateItemTypeDto } from '../dto/update-item-type.dto';
import { ITEM_TYPE_LABEL_NOT_UNIQUE } from '../messages/item-type';

@Injectable()
export class ItemTypeService {
  constructor(private readonly database: DatabaseService) {}

  async create(payload: CreateItemTypeDto, user: UserRow): Promise<ItemTypeRow> {
    await this.assertUniqueLabelForUser({ userId: user.id, label: payload.label });

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

    if (payload.label != null) {
      await this.assertUniqueLabelForUser({
        userId: user.id,
        label: payload.label,
        excludeItemTypeId: id,
      });
    }

    const itemType: Updateable<ItemType> = {
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

  /** Case-insensitive: "Produce" and "produce" collide for the same user only. */
  private async assertUniqueLabelForUser({
    userId,
    label,
    excludeItemTypeId,
  }: {
    userId: string;
    label: string;
    excludeItemTypeId?: string;
  }): Promise<void> {
    let query = this.database
      .selectFrom('ItemType')
      .where('userId', '=', userId)
      .where((eb) => eb(eb.fn('lower', [eb.ref('label')]), '=', eb.fn('lower', [eb.val(label)])))
      .select('id');

    if (excludeItemTypeId != null) {
      query = query.where('id', '<>', excludeItemTypeId);
    }

    const existing = await query.executeTakeFirst();
    if (existing != null) {
      throw new UnprocessableEntityException({
        label: [{ message: ITEM_TYPE_LABEL_NOT_UNIQUE }],
      });
    }
  }
}
