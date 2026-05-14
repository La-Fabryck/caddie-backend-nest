import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AuthConfig } from '@/config/auth.config';
import type { LoginDto } from '../dto/login.dto';
import type { AuthenticationService } from './authentication.service';

@Controller('authentication')
export class AuthenticationController {
  private readonly auth: AuthConfig;

  constructor(
    configService: ConfigService,
    private readonly authentificationService: AuthenticationService,
  ) {
    this.auth = configService.getOrThrow<AuthConfig>('auth');
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() reply: FastifyReply) {
    const { accessToken, refreshToken } =
      await this.authentificationService.login(loginDto);
    const accessCookieKey = this.auth.accessCookieName;
    const refreshCookieKey = this.auth.refreshCookieName;

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
    const accessCookieKey = this.auth.accessCookieName;
    const refreshCookieKey = this.auth.refreshCookieName;
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
    const accessCookieKey = this.auth.accessCookieName;
    const refreshCookieKey = this.auth.refreshCookieName;

    return reply
      .clearCookie(accessCookieKey)
      .clearCookie(refreshCookieKey)
      .send();
  }
}
