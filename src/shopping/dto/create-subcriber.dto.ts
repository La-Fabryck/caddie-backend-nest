import type { Subscriber } from '@prisma/client';
import { IsUUID } from 'class-validator';
import { IsNotBlank } from '@/lib/decorators/is-not-blank';
import { SUBSCRIBER_NAME } from '../messages/subscriber';

type CreateSubcriberInterface = Omit<Subscriber, 'id' | 'userId'>;

export class CreateSubcriberDto implements CreateSubcriberInterface {
  //TODO: Remove
  @IsUUID()
  listId!: string;

  @IsNotBlank({ message: SUBSCRIBER_NAME })
  name!: string;
}
