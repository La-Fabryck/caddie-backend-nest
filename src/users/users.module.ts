import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { AuthConfig } from '@/config/auth.config';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const auth = configService.getOrThrow<AuthConfig>('auth');
        return {
          global: true,
          secret: auth.accessTokenSecret,
          signOptions: { expiresIn: auth.accessTokenTtl },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthenticationController, UsersController],
  providers: [AuthenticationService, UsersService],
  exports: [UsersService, JwtModule],
})
export class UsersModule {}
