import { Subscriber } from '@prisma/client';
import { IsUUID } from 'class-validator';
import { IsNotBlank } from '@/lib/decorators/is-not-blank';

type CreateSubcriberInterface = Omit<Subscriber, 'id' | 'userId'>;

export class CreateSubcriberDto implements CreateSubcriberInterface {
  @IsUUID()
  listId!: string;

  @IsNotBlank()
  name!: string;
}
