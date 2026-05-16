import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsString } from 'class-validator';
import type { StringValue } from 'ms';
import { IsMsDurationString } from '@/lib/decorators/is-ms-duration';
import { validateWithClass } from './validate-with-class';

export type AuthConfig = {
  accessCookieName: string;
  refreshCookieName: string;
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenTtl: StringValue;
  refreshTokenTtl: StringValue;
};

class AuthConfigDto implements AuthConfig {
  @IsString()
  @IsNotEmpty()
  accessCookieName!: string;

  @IsString()
  @IsNotEmpty()
  refreshCookieName!: string;

  @IsString()
  @IsNotEmpty()
  accessTokenSecret!: string;

  @IsString()
  @IsNotEmpty()
  refreshTokenSecret!: string;

  @IsMsDurationString()
  accessTokenTtl!: StringValue;

  @IsMsDurationString()
  refreshTokenTtl!: StringValue;
}

export default registerAs('auth', (): AuthConfig => {
  const plain: Record<string, unknown> = {
    accessCookieName: process.env['ACCESS_COOKIE_NAME'],
    refreshCookieName: process.env['REFRESH_COOKIE_NAME'],
    accessTokenSecret: process.env['ACCESS_TOKEN_SECRET'],
    refreshTokenSecret: process.env['REFRESH_TOKEN_SECRET'],
    accessTokenTtl: process.env['ACCESS_TOKEN_TTL'],
    refreshTokenTtl: process.env['REFRESH_TOKEN_TTL'],
  };

  return validateWithClass(AuthConfigDto, plain, 'Auth configuration validation failed');
});
