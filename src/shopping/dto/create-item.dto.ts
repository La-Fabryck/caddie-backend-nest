import { IsInt, IsOptional, Min } from 'class-validator';
import { Insertable } from 'kysely';
import type { Item } from '@/database/database-types';
import { IsNotBlank } from '@/lib/decorators/is-not-blank';
import { ITEM_NAME, ITEM_QUANTITY } from '../messages/items';

// TODO: Add type for Insertable<Item> when reworking the architecture
type CreateItemInterface = Omit<Insertable<Item>, 'id' | 'listId' | 'isInCart'>;

const DEFAULT_ITEM_QUANTITY = 1;

export class CreateItemDto implements CreateItemInterface {
  @IsNotBlank({ message: ITEM_NAME })
  name!: string;

  @IsOptional()
  @IsInt({ message: ITEM_QUANTITY })
  @Min(DEFAULT_ITEM_QUANTITY, { message: ITEM_QUANTITY })
  quantity?: number;
}
