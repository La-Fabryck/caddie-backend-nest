import {
  Body,
  Controller,
  Cookies,
  type CookieSerializeOptions,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import type { AuthConfig } from '@/config/auth.config';
import { msDurationToSeconds } from '@/lib/zod/z-ms-duration';
import { type LoginDto, loginSchema } from '../dto/login.dto';
import { invalidTokenError } from '../utils/auth-error-bodies';
import { AuthenticationService } from './authentication.service';

@Controller('authentication')
export class AuthenticationController {
  private readonly auth: AuthConfig;
  private readonly accessCookieOptions: CookieSerializeOptions;
  private readonly refreshCookieOptions: CookieSerializeOptions;

  constructor(
    configService: ConfigService,
    private readonly authentificationService: AuthenticationService,
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {
    this.auth = configService.getOrThrow<AuthConfig>('auth');
    this.accessCookieOptions = this.sessionCookieOptions(msDurationToSeconds(this.auth.accessTokenTtl));
    this.refreshCookieOptions = this.sessionCookieOptions(msDurationToSeconds(this.auth.refreshTokenTtl));
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body({ schema: loginSchema }) loginDto: LoginDto, @Res({ passthrough: true }) response: unknown): Promise<void> {
    const { accessToken, refreshToken } = await this.authentificationService.login(loginDto);
    this.setSessionCookies(response, accessToken, refreshToken);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Cookies() cookies: Record<string, string>, @Res({ passthrough: true }) response: unknown): Promise<void> {
    const refreshToken = cookies[this.auth.refreshCookieName];

    if (refreshToken == null) {
      throw new UnauthorizedException(invalidTokenError);
    }

    const tokens = await this.authentificationService.refresh(refreshToken);
    this.setSessionCookies(response, tokens.accessToken, tokens.refreshToken);
  }

  @Get('logout')
  logout(@Res({ passthrough: true }) response: unknown): void {
    const { httpAdapter } = this.httpAdapterHost;
    httpAdapter.clearCookie(response, this.auth.accessCookieName, { path: '/' });
    httpAdapter.clearCookie(response, this.auth.refreshCookieName, { path: '/' });
  }

  private setSessionCookies(response: unknown, accessToken: string, refreshToken: string): void {
    const { httpAdapter } = this.httpAdapterHost;
    httpAdapter.setCookie(response, this.auth.accessCookieName, accessToken, this.accessCookieOptions);
    httpAdapter.setCookie(response, this.auth.refreshCookieName, refreshToken, this.refreshCookieOptions);
  }

  private sessionCookieOptions(maxAge: number): CookieSerializeOptions {
    return {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      path: '/',
      maxAge,
    };
  }
}
