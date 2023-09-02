import { List } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

type CreateListInterface = Omit<List, 'id' | 'authorId'>;

export class CreateListDto implements CreateListInterface {
  @IsNotEmpty()
  title: string;
}
