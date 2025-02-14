import { List } from '@prisma/client';
import { IsNotBlank } from '@/lib/decorators/is-not-blank';
import { LIST_PSEUDONYM, LIST_TITLE } from '../messages/list';

type CreateListInterface = Pick<List, 'title'>;

export class CreateListDto implements CreateListInterface {
  @IsNotBlank({ message: LIST_TITLE })
  title!: string;

  @IsNotBlank({ message: LIST_PSEUDONYM })
  pseudonym!: string;
}
