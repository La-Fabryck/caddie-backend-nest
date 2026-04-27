import { Module } from '@nestjs/common';
import { UsersModule } from '@/users/users.module';
import { ItemTypeController } from './item-type/item-type.controller';
import { ItemTypeService } from './item-type/item-type.service';
import { ItemController } from './item/item.controller';
import { ItemService } from './item/item.service';
import { ListController } from './list/list.controller';
import { ListService } from './list/list.service';
import { SubscribersController } from './subscriber/subscribers.controller';
import { SubscribersService } from './subscriber/subscribers.service';

@Module({
  controllers: [ItemController, ItemTypeController, ListController, SubscribersController],
  exports: [ListService],
  imports: [UsersModule],
  providers: [ItemService, ItemTypeService, ListService, SubscribersService],
})
export class ShoppingModule {}
