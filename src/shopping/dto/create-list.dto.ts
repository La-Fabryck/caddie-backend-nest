import { List } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

type CreateListInterface = Pick<List, 'title'>;

export class CreateListDto implements CreateListInterface {
  @IsNotEmpty()
  title!: string;

  @IsNotEmpty()
  pseudonym!: string;
}
