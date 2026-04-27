import type { ItemType } from '@/database/database-types';
import { IsNotBlank } from '@/lib/decorators/is-not-blank';
import { ITEM_TYPE_LABEL } from '../messages/item-type';

type CreateItemTypeInterface = Pick<ItemType, 'label'>;

export class CreateItemTypeDto implements CreateItemTypeInterface {
  @IsNotBlank({ message: ITEM_TYPE_LABEL })
  label!: string;
}
