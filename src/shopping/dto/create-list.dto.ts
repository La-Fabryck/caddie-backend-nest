import { List } from '@prisma/client';
import { IsNotEmpty, IsUUID } from 'class-validator';

type CreateListInterface = Omit<List, 'id'>;

export class CreateListDto implements CreateListInterface {
  @IsUUID()
  authorId: string;

  @IsNotEmpty()
  title: string;
}
