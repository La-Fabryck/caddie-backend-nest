import type { CookieSerializeOptions } from '@fastify/cookie';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AuthConfig } from '@/config/auth.config';
import { msDurationToSeconds } from '@/lib/zod/z-ms-duration';
import { type LoginDto, loginSchema } from '../dto/login.dto';
import { AuthenticationService } from './authentication.service';

function sessionCookieOptions(maxAge: number): CookieSerializeOptions {
  return {
    httpOnly: true,
    sameSite: true,
    secure: true,
    path: '/',
    maxAge,
  };
}

@Controller('authentication')
export class AuthenticationController {
  private readonly auth: AuthConfig;
  private readonly accessCookieOptions: CookieSerializeOptions;
  private readonly refreshCookieOptions: CookieSerializeOptions;

  constructor(
    configService: ConfigService,
    private readonly authentificationService: AuthenticationService,
  ) {
    this.auth = configService.getOrThrow<AuthConfig>('auth');
    this.accessCookieOptions = sessionCookieOptions(msDurationToSeconds(this.auth.accessTokenTtl));
    this.refreshCookieOptions = sessionCookieOptions(msDurationToSeconds(this.auth.refreshTokenTtl));
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body({ schema: loginSchema }) loginDto: LoginDto, @Res() reply: FastifyReply) {
    const { accessToken, refreshToken } = await this.authentificationService.login(loginDto);
    const accessCookieKey = this.auth.accessCookieName;
    const refreshCookieKey = this.auth.refreshCookieName;

    return reply
      .cookie(accessCookieKey, accessToken, this.accessCookieOptions)
      .cookie(refreshCookieKey, refreshToken, this.refreshCookieOptions)
      .send();
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    const accessCookieKey = this.auth.accessCookieName;
    const refreshCookieKey = this.auth.refreshCookieName;
    const refreshToken = request.cookies[refreshCookieKey] ?? null;

    if (refreshToken == null) {
      throw new UnauthorizedException();
    }

    const tokens = await this.authentificationService.refresh(refreshToken);

    return reply
      .cookie(accessCookieKey, tokens.accessToken, this.accessCookieOptions)
      .cookie(refreshCookieKey, tokens.refreshToken, this.refreshCookieOptions)
      .send();
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) reply: FastifyReply) {
    const accessCookieKey = this.auth.accessCookieName;
    const refreshCookieKey = this.auth.refreshCookieName;

    return reply.clearCookie(accessCookieKey).clearCookie(refreshCookieKey).send();
  }
}
