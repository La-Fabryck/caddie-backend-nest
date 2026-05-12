import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { FastifyRequest } from 'fastify';
import type { AuthConfig } from '@/config/auth.config';
import type { JwtPayload } from '../authentication/authentication.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly logger = new Logger(AuthenticationGuard.name);
  private readonly auth: AuthConfig;

  constructor(
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
    this.auth = configService.getOrThrow<AuthConfig>('auth');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: FastifyRequest = context.switchToHttp().getRequest();
    const cookieKey = this.auth.accessCookieName;

    const token = request.cookies[cookieKey] ?? null;
    if (token == null) {
      this.logger.warn('Access token cookie is missing');
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.auth.accessTokenSecret,
      });

      request.userId = payload.sub;

      return true;
    } catch (error: unknown) {
      if (error instanceof TokenExpiredError) {
        this.logger.debug(`Access token expired at ${String(error.expiredAt)}`);
      } else if (error instanceof Error) {
        this.logger.warn(`Access token verification failed: ${error.name}, cause : ${error.cause}`);
      } else {
        this.logger.error(`Access token verification failed: ${error}`);
      }

      throw new UnauthorizedException();
    }
  }
}
