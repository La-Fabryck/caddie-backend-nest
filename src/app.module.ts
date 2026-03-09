import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import type { UserRow } from '@/database/database-types';
import { DatabaseModule } from './database/database.module';
import { ShoppingModule } from './shopping/shopping.module';
import { UsersModule } from './users/users.module';

/**
 * Through Module Augmentation, we attach a user & userId props to the Request object
 * https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
 */
declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
    user?: UserRow;
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.development'],
      cache: true,
      isGlobal: true,
    }),
    DatabaseModule,
    UsersModule,
    ShoppingModule,
  ],
})
export class AppModule {}
