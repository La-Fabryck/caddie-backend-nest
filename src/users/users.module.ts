import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthenticationService } from './authentication/authentication.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { AuthenticationController } from './authentication/authentication.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('SECRET'),
          signOptions: { expiresIn: '3600s' },
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
