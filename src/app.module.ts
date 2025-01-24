import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { User } from '@prisma/client';
import { DatabaseModule } from './database/database.module';
import { ShoppingModule } from './shopping/shopping.module';
import { UsersModule } from './users/users.module';

/**
 * Module Augmentation
 * https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
 */
declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
    user: User;
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
