import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { LoginDto } from '../dto/login.dto';
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from '../utils/constants';
import { AuthenticationService } from './authentication.service';

@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authentificationService: AuthenticationService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() reply: FastifyReply) {
    const { accessToken, refreshToken } = await this.authentificationService.login(loginDto);
    const accessCookieKey = this.getAccessCookieKey();
    const refreshCookieKey = this.getRefreshCookieKey();

    return reply
      .cookie(accessCookieKey, accessToken, {
        httpOnly: true,
        sameSite: true,
        secure: true,
        path: '/',
      })
      .cookie(refreshCookieKey, refreshToken, {
        httpOnly: true,
        sameSite: true,
        secure: true,
        path: '/',
      })
      .send();
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    const accessCookieKey = this.getAccessCookieKey();
    const refreshCookieKey = this.getRefreshCookieKey();
    const refreshToken = request.cookies[refreshCookieKey] ?? null;

    if (refreshToken == null) {
      throw new UnauthorizedException();
    }

    const tokens = await this.authentificationService.refresh(refreshToken);

    return reply
      .cookie(accessCookieKey, tokens.accessToken, {
        httpOnly: true,
        sameSite: true,
        secure: true,
        path: '/',
      })
      .cookie(refreshCookieKey, tokens.refreshToken, {
        httpOnly: true,
        sameSite: true,
        secure: true,
        path: '/',
      })
      .send();
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) reply: FastifyReply) {
    const accessCookieKey = this.getAccessCookieKey();
    const refreshCookieKey = this.getRefreshCookieKey();

    return reply.clearCookie(accessCookieKey).clearCookie(refreshCookieKey).send();
  }

  // FIXME: Better env var handling
  private getAccessCookieKey(): string {
    return this.configService.getOrThrow<string>(ACCESS_COOKIE_NAME);
  }

  private getRefreshCookieKey(): string {
    return this.configService.getOrThrow<string>(REFRESH_COOKIE_NAME);
  }
}
