import { Module } from '@nestjs/common';
import { UsersModule } from '@/users/users.module';
import { ItemController } from './item/item.controller';
import { ItemService } from './item/item.service';
import { ListController } from './list/list.controller';
import { ListService } from './list/list.service';
import { SubscribersController } from './subscriber/subscribers.controller';
import { SubscribersService } from './subscriber/subscribers.service';

@Module({
  controllers: [ItemController, ListController, SubscribersController],
  exports: [ListService],
  imports: [UsersModule],
  providers: [ItemService, ListService, SubscribersService],
})
export class ShoppingModule {}
