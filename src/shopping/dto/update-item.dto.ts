import { PartialType } from '@nestjs/mapped-types';
import type { Item } from '@/database/database-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateItemDto } from './create-item.dto';

type UpdateItemInterface = Omit<Item, 'id' | 'listId'>;

export class UpdateItemDto extends PartialType(CreateItemDto) implements Partial<UpdateItemInterface> {
  @IsOptional()
  @IsBoolean()
  isInCart?: boolean;
}
