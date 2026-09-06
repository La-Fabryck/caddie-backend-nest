import type { CookieSerializeOptions } from '@fastify/cookie';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AuthConfig } from '@/config/auth.config';
import { msDurationToSeconds } from '@/lib/zod/z-ms-duration';
import { type LoginDto, loginSchema } from '../dto/login.dto';
import { AuthenticationService } from './authentication.service';

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
    this.accessCookieOptions = this.sessionCookieOptions(msDurationToSeconds(this.auth.accessTokenTtl));
    this.refreshCookieOptions = this.sessionCookieOptions(msDurationToSeconds(this.auth.refreshTokenTtl));
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body({ schema: loginSchema }) loginDto: LoginDto, @Res() reply: FastifyReply): Promise<FastifyReply> {
    const { accessToken, refreshToken } = await this.authentificationService.login(loginDto);

    return reply
      .cookie(this.auth.accessCookieName, accessToken, this.accessCookieOptions)
      .cookie(this.auth.refreshCookieName, refreshToken, this.refreshCookieOptions)
      .send();
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Req() request: FastifyRequest, @Res() reply: FastifyReply): Promise<FastifyReply> {
    const refreshToken = request.cookies[this.auth.refreshCookieName];

    if (refreshToken == null) {
      throw new UnauthorizedException();
    }

    const tokens = await this.authentificationService.refresh(refreshToken);

    return reply
      .cookie(this.auth.accessCookieName, tokens.accessToken, this.accessCookieOptions)
      .cookie(this.auth.refreshCookieName, tokens.refreshToken, this.refreshCookieOptions)
      .send();
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) reply: FastifyReply): Promise<FastifyReply> {
    return reply.clearCookie(this.auth.accessCookieName).clearCookie(this.auth.refreshCookieName).send();
  }

  private sessionCookieOptions(maxAge: number): CookieSerializeOptions {
    return {
      httpOnly: true,
      sameSite: true,
      secure: true,
      path: '/',
      maxAge,
    };
  }
}
