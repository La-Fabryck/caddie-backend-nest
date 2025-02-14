import { List } from '@prisma/client';
import { IsNotBlank } from '@/lib/decorators/is-not-blank';

type CreateListInterface = Pick<List, 'title'>;

export class CreateListDto implements CreateListInterface {
  @IsNotBlank()
  title!: string;

  @IsNotBlank()
  pseudonym!: string;
}
