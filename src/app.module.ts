import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfiguration from '@/config/app.config';
import authConfiguration from '@/config/auth.config';
import databaseConfiguration from '@/config/database.config';
import { DatabaseModule } from './database/database.module';
import { ShoppingModule } from './shopping/shopping.module';
import { authStorageMiddleware } from './users/authentication/auth-storage';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfiguration, databaseConfiguration, authConfiguration],
      ignoreEnvFile: true,
      cache: true,
      isGlobal: true,
    }),
    DatabaseModule,
    UsersModule,
    ShoppingModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(authStorageMiddleware).forRoutes('*path');
  }
}
