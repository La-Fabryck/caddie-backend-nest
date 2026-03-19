import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import type { ItemRow } from '@/database/database-types';
import { CreateItemDto } from './create-item.dto';

type UpdateItemInterface = Omit<ItemRow, 'id' | 'listId'>;

export class UpdateItemDto extends PartialType(CreateItemDto) implements Partial<UpdateItemInterface> {
  @IsOptional()
  @IsBoolean()
  isInCart?: boolean;
}
