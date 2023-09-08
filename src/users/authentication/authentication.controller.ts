import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from '../dto/login.dto';
import { addDays } from '../utils/add-days';
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
    const jwt: Awaited<Promise<string>> =
      await this.authentificationService.login(loginDto);
    const cookieKey = this.configService.get<string>(COOKIE_NAME)!;

    return res
      .cookie(cookieKey, jwt, {
        expires: addDays(new Date(), 60),
        httpOnly: true,
        sameSite: true,
        secure: true,
      })
      .send();
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) res: FastifyReply) {
    return res.clearCookie(COOKIE_NAME).send();
  }
}
