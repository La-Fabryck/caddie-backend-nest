import { Item } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

type CreateItemInterface = Omit<Item, 'id' | 'listId'>;

export class CreateItemDto implements CreateItemInterface {
  @IsNotEmpty()
  name!: string;
}
