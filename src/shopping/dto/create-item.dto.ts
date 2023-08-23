import { Item } from '@prisma/client';
import { IsNotEmpty, IsUUID } from 'class-validator';

type CreateItemInterface = Omit<Item, 'id'>;

export class CreateItemDto implements CreateItemInterface {
  @IsUUID()
  listId: string;

  @IsNotEmpty()
  name: string;
}
