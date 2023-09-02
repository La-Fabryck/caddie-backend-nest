import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { JwtModule } from '@nestjs/jwt';
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
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          global: true,
          secret: configService.get<string>('SECRET'),
          signOptions: { expiresIn: '3600s' },
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    ShoppingModule,
  ],
  exports: [JwtModule],
})
export class AppModule {}
