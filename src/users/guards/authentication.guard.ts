import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { FastifyRequest } from 'fastify';
import { type JwtPayload } from '../authentication/authentication.service';
import { COOKIE_NAME } from '../utils/constants';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: FastifyRequest = context.switchToHttp().getRequest();
    const cookieKey = this.configService.getOrThrow<string>(COOKIE_NAME);

    const token = request.cookies[cookieKey] ?? null;
    if (token == null) {
      throw new UnauthorizedException();
    }

    const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

    request.userId = payload.sub;

    return true;
  }
}
