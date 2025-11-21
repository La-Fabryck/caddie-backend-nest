import type { Item } from '@prisma/client';
import { IsNotBlank } from '@/lib/decorators/is-not-blank';
import { ITEM_NAME } from '../messages/items';

type CreateItemInterface = Omit<Item, 'id' | 'listId' | 'isInCart'>;

export class CreateItemDto implements CreateItemInterface {
  @IsNotBlank({ message: ITEM_NAME })
  name!: string;
}
