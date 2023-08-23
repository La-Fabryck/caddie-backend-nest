import { Module } from '@nestjs/common';
import { ItemController } from './item/item.controller';
import { ItemService } from './item/item.service';
import { ListController } from './list/list.controller';
import { ListService } from './list/list.service';

@Module({
  controllers: [ItemController, ListController],
  providers: [ItemService, ListService],
})
export class ShoppingModule {}
