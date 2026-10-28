import { type CanActivate, type ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import type { AuthConfig } from '@/config/auth.config';
import { authStorage } from '../authentication/auth-storage';
import type { JwtPayload } from '../authentication/authentication.service';
import { readRequestCookie } from '../authentication/read-request-cookie';
import { invalidTokenError } from '../utils/auth-error-bodies';
import { formatErrorForLog } from '../utils/format-error-for-log';

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
    const request = context.switchToHttp().getRequest<{ headers: { cookie?: string | string[] } }>();
    const token = readRequestCookie(request.headers.cookie, this.auth.accessCookieName) ?? null;
    if (token == null) {
      this.logger.warn('Access token cookie is missing');
      throw new UnauthorizedException(invalidTokenError);
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.auth.accessTokenSecret,
      });
    } catch (error: unknown) {
      if (error instanceof TokenExpiredError) {
        this.logger.debug(`Access token expired at ${formatErrorForLog(error.expiredAt)}`);
      } else if (error instanceof Error) {
        this.logger.warn(`Access token verification failed: ${formatErrorForLog(error)}`);
      } else {
        this.logger.error(`Access token verification failed: ${formatErrorForLog(error)}`);
      }

      throw new UnauthorizedException(invalidTokenError);
    }

    const store = authStorage.getStore();
    if (store == null) {
      throw new Error('Auth storage was not entered for this request');
    }
    store.userId = payload.sub;

    return true;
  }
}
