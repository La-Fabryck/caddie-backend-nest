import { IsOptional } from 'class-validator';
import type { ItemTypeRow } from '@/database/database-types';
import { IsNotBlank } from '@/lib/decorators/is-not-blank';
import { ITEM_TYPE_LABEL } from '../messages/item-type';

type UpdateItemTypeInterface = Omit<ItemTypeRow, 'id' | 'listId' | 'userId'>;

export class UpdateItemTypeDto implements Partial<UpdateItemTypeInterface> {
  @IsOptional()
  @IsNotBlank({ message: ITEM_TYPE_LABEL })
  label?: string;
}
