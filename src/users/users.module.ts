import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { ACCESS_TOKEN_SECRET, ACCESS_TOKEN_TTL } from './utils/constants';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          global: true,
          secret: configService.getOrThrow<string>(ACCESS_TOKEN_SECRET),
          signOptions: { expiresIn: configService.getOrThrow<string>(ACCESS_TOKEN_TTL) as StringValue },
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
