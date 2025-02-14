import { Item } from '@prisma/client';
import { IsNotBlank } from '@/lib/decorators/is-not-blank';

type CreateItemInterface = Omit<Item, 'id' | 'listId'>;

export class CreateItemDto implements CreateItemInterface {
  @IsNotBlank()
  name!: string;
}
