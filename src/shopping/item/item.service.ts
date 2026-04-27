import { Injectable, NotFoundException } from '@nestjs/common';
import { Insertable, type Kysely, Updateable } from 'kysely';
import type { DB, Item, ItemRow, ItemTypeRow, UserRow } from '@/database/database-types';
import { DatabaseService } from '@/database/database.service';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { ItemTypeService } from '../item-type/item-type.service';
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
type ItemWithTypeRow = ItemRow & { itemType: Omit<ItemTypeRow, 'userId'> | null };

@Injectable()
class ItemService {
  private toItemWithTypeRow(row: {
    id: string;
    listId: string;
    name: string;
    isInCart: boolean;
    quantity: number;
    itemTypeId: string | null;
    itemType_id: string | null;
    itemType_label: string | null;
  }): ItemWithTypeRow {
    return {
      id: row.id,
      listId: row.listId,
      name: row.name,
      isInCart: row.isInCart,
      quantity: row.quantity,
      itemTypeId: row.itemTypeId,
      itemType: row.itemType_id == null ? null : { id: row.itemType_id, label: row.itemType_label ?? '' },
    };
  }

  constructor(
    private readonly database: DatabaseService,
    private readonly listService: ListService,
    private readonly itemTypeService: ItemTypeService,
  ) {}

  private async findOneWithType({
    itemId,
    listId,
    database = this.database,
  }: {
    itemId: string;
    listId: string;
    database?: Kysely<DB>;
  }): Promise<ItemWithTypeRow> {
    const row = await database
      .selectFrom('Item')
      .leftJoin('ItemType', 'ItemType.id', 'Item.itemTypeId')
      .where('Item.id', '=', itemId)
      .where('Item.listId', '=', listId)
      .selectAll('Item')
      .select(['ItemType.id as itemType_id', 'ItemType.label as itemType_label'])
      .executeTakeFirst();

    if (row == null) {
      throw new NotFoundException();
    }

    return this.toItemWithTypeRow(row);
  }

  async create({ createItemPayload, user }: CreateItem): Promise<ItemWithTypeRow> {
    // verify that the lists is accessible by the user
    await this.listService.findOneById({
      id: createItemPayload.listId,
      user,
    });

    if (createItemPayload.itemTypeId != null) {
      // verify that the item type belongs to the current user
      await this.itemTypeService.findOneByIdForUser({
        id: createItemPayload.itemTypeId,
        user,
      });
    }

    return this.database.transaction().execute(async (trx) => {
      await this.listService.updateDate(createItemPayload.listId, trx);

      const item: Insertable<Item> = {
        listId: createItemPayload.listId,
        name: createItemPayload.name,
        quantity: createItemPayload.quantity,
        itemTypeId: createItemPayload.itemTypeId ?? null,
      };

      // Use a CTE (Common Table Expression) so insert + type enrichment happen in one SQL statement.
      // `RETURNING` alone can only return columns from `Item`, not joined `ItemType` fields.
      const row = await trx
        .with('createdItem', (database) => database.insertInto('Item').values(item).returningAll())
        .selectFrom('createdItem')
        .leftJoin('ItemType', 'ItemType.id', 'createdItem.itemTypeId')
        .selectAll('createdItem')
        .select(['ItemType.id as itemType_id', 'ItemType.label as itemType_label'])
        .executeTakeFirstOrThrow();

      return this.toItemWithTypeRow(row);
    });
  }

  async findAllWithTypeByListId({ listId, user }: FindItems): Promise<ItemWithTypeRow[]> {
    await this.listService.findOneById({ id: listId, user });

    const rows = await this.database
      .selectFrom('Item')
      .leftJoin('ItemType', 'ItemType.id', 'Item.itemTypeId')
      .where('listId', '=', listId)
      .orderBy((eb) => eb.fn('lower', ['name']), 'asc')
      .selectAll('Item')
      .select(['ItemType.id as itemType_id', 'ItemType.label as itemType_label'])
      .execute();

    return rows.map((row) => this.toItemWithTypeRow(row));
  }

  async findOne({ itemId, listId, user }: FindItem): Promise<ItemWithTypeRow> {
    // verify that the lists is accessible by the user
    await this.listService.findOneById({ id: listId, user });
    return this.findOneWithType({ itemId, listId });
  }

  async update({ updateItemPayload, user }: UpdateItem): Promise<ItemWithTypeRow> {
    const { id: itemId, listId, ...payload } = updateItemPayload;

    await this.findOne({
      itemId,
      listId,
      user,
    });

    if (payload.itemTypeId != null) {
      // verify that the item type belongs to the current user
      await this.itemTypeService.findOneByIdForUser({
        id: payload.itemTypeId,
        user,
      });
    }

    return this.database.transaction().execute(async (trx) => {
      await this.listService.updateDate(updateItemPayload.listId, trx);

      const item: Updateable<Item> = {
        ...payload,
      };

      // Same pattern as create: update + join in one SQL round trip.
      // We keep listId in the WHERE clause so route list and item stay consistent.
      const row = await trx
        .with('updatedItem', (database) =>
          database.updateTable('Item').set(item).where('id', '=', itemId).where('listId', '=', listId).returningAll(),
        )
        .selectFrom('updatedItem')
        .leftJoin('ItemType', 'ItemType.id', 'updatedItem.itemTypeId')
        .selectAll('updatedItem')
        .select(['ItemType.id as itemType_id', 'ItemType.label as itemType_label'])
        .executeTakeFirstOrThrow();

      return this.toItemWithTypeRow(row);
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
