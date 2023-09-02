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
import { LoginDto } from '../dto/login.dto';
import { addDays } from '../utils/add-days';
import { AuthenticationService } from './authentication.service';

@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly authentificationService: AuthenticationService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: FastifyReply) {
    const jwt: Awaited<Promise<string>> =
      await this.authentificationService.login(loginDto);

    return res
      .cookie('SESSION_ID', jwt, {
        expires: addDays(new Date(), 60),
        httpOnly: true,
        sameSite: true,
        secure: true,
      })
      .send();
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) res: FastifyReply) {
    return res.clearCookie('SESSION_ID').send();
  }
}
