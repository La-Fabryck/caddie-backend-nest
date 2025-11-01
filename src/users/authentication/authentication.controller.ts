import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type FastifyReply } from 'fastify';
import { LoginDto } from '../dto/login.dto';
import { COOKIE_NAME } from '../utils/constants';
import { AuthenticationService } from './authentication.service';

@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authentificationService: AuthenticationService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: FastifyReply) {
    const jwt: Awaited<Promise<string>> = await this.authentificationService.login(loginDto);
    const cookieKey = this.configService.getOrThrow<string>(COOKIE_NAME);

    return res
      .cookie(cookieKey, jwt, {
        httpOnly: true,
        sameSite: true,
        secure: true,
        path: '/',
      })
      .send();
  }

  @Get('logout')
  // TODO: logging
  // Cannot use injection with static methods
  async logout(@Res({ passthrough: true }) res: FastifyReply) {
    return res.clearCookie(COOKIE_NAME).send();
  }
}
