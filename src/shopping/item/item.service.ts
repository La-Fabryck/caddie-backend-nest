import { Injectable, NotFoundException } from '@nestjs/common';
import { Insertable, Updateable } from 'kysely';
import type { Item, ItemRow, UserRow } from '@/database/database-types';
import { DatabaseService } from '@/database/database.service';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { ListService } from '../list/list.service';

type CreateItem = {
  createItemPayload: CreateItemDto & Pick<Item, 'listId'>;
  user: UserRow;
};

type UpdateItem = {
  updateItemPayload: UpdateItemDto & Pick<ItemRow, 'listId' | 'id'>;
  user: UserRow;
};

type FindItem = { listId: string; itemId: string; user: UserRow };

type FindItems = { listId: string; user: UserRow };

@Injectable()
class ItemService {
  constructor(
    private readonly database: DatabaseService,
    private readonly listService: ListService,
  ) {}

  async create({ createItemPayload, user }: CreateItem): Promise<ItemRow> {
    await this.listService.findOneById({
      id: createItemPayload.listId,
      user,
    });

    return this.database.transaction().execute(async (trx) => {
      await this.listService.updateDate(createItemPayload.listId, trx);

      const item: Insertable<Item> = {
        listId: createItemPayload.listId,
        name: createItemPayload.name,
        quantity: createItemPayload.quantity,
      };

      const row = await trx.insertInto('Item').values(item).returningAll().executeTakeFirstOrThrow();

      return row;
    });
  }

  async findAllByListId({ listId, user }: FindItems): Promise<ItemRow[]> {
    await this.listService.findOneById({ id: listId, user });

    // Sort by lowercase name to keep ordering case-insensitive.
    return this.database
      .selectFrom('Item')
      .where('listId', '=', listId)
      .orderBy((eb) => eb.fn('lower', ['name']), 'asc')
      .selectAll()
      .execute();
  }

  async findOne({ itemId, listId, user }: FindItem): Promise<ItemRow> {
    await this.listService.findOneById({ id: listId, user });

    const item = await this.database.selectFrom('Item').where('id', '=', itemId).selectAll().executeTakeFirst();

    if (item == null) {
      throw new NotFoundException();
    }

    return item;
  }

  async update({ updateItemPayload, user }: UpdateItem): Promise<ItemRow> {
    const { id: itemId, listId, ...payload } = updateItemPayload;

    await this.findOne({
      itemId,
      listId,
      user,
    });

    return this.database.transaction().execute(async (trx) => {
      await this.listService.updateDate(updateItemPayload.listId, trx);

      const item: Updateable<Item> = {
        ...payload,
      };

      const row = await trx.updateTable('Item').set(item).where('id', '=', itemId).returningAll().executeTakeFirstOrThrow();

      return row;
    });
  }

  async remove(listId: string, itemId: string, user: UserRow): Promise<void> {
    await this.findOne({ itemId, listId, user });

    await this.database.transaction().execute(async (trx) => {
      await this.listService.updateDate(listId, trx);
      await trx.deleteFrom('Item').where('id', '=', itemId).execute();
    });
  }
}

export { ItemService, type CreateItem };
