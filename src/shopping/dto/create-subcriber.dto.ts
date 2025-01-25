import { Subscriber } from '@prisma/client';
import { IsNotEmpty, IsUUID } from 'class-validator';

type CreateSubcriberInterface = Omit<Subscriber, 'id' | 'userId'>;

export class CreateSubcriberDto implements CreateSubcriberInterface {
  @IsUUID()
  listId!: string;

  @IsNotEmpty()
  name!: string;
}
