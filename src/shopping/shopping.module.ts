import { Module } from '@nestjs/common';
import { ItemController } from './item/item.controller';
import { ItemService } from './item/item.service';
import { ListController } from './list/list.controller';
import { ListService } from './list/list.service';
import { UsersModule } from '@/users/users.module';

@Module({
  controllers: [ItemController, ListController],
  imports: [UsersModule],
  providers: [ItemService, ListService],
})
export class ShoppingModule {}
