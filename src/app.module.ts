import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { ShoppingModule } from './shopping/shopping.module';

@Module({
  imports: [DatabaseModule, UsersModule, ShoppingModule],
})
export class AppModule {}
