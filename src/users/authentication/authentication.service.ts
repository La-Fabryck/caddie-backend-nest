import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions, TokenExpiredError } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import type { AuthConfig } from '@/config/auth.config';
import type { LoginDto } from '../dto/login.dto';
import { UsersService } from '../users/users.service';
import { invalidLoginError, invalidTokenError } from '../utils/auth-error-bodies';
import { formatErrorForLog } from '../utils/format-error-for-log';

/** Registered claims we use: https://datatracker.ietf.org/doc/html/rfc7519#section-4.1 */
export interface JwtPayload {
  sub: string;
  exp?: number;
  iat?: number;
}
export type AuthTokens = { accessToken: string; refreshToken: string };

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);
  private readonly auth: AuthConfig;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
    this.auth = configService.getOrThrow<AuthConfig>('auth');
  }

  async login(loginDto: LoginDto): Promise<AuthTokens> {
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (user == null) {
      throw new UnauthorizedException(invalidLoginError);
    }

    const isPasswordValid = await compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(invalidLoginError);
    }

    const payload = { sub: user.id };
    const [accessToken, refreshToken] = await Promise.all([this.signAccessToken(payload), this.signRefreshToken(payload)]);

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.auth.refreshTokenSecret,
      });
    } catch (error: unknown) {
      if (error instanceof TokenExpiredError) {
        this.logger.log(`Refresh token expired at ${formatErrorForLog(error.expiredAt)}`);
      } else if (error instanceof Error) {
        this.logger.warn(`Refresh token verification failed: ${formatErrorForLog(error)}`);
      } else {
        this.logger.error(`Refresh token verification failed: ${formatErrorForLog(error)}`);
      }

      throw new UnauthorizedException(invalidTokenError);
    }

    return {
      accessToken: await this.signAccessToken({ sub: payload.sub }),
      refreshToken,
    };
  }

  private async signAccessToken(payload: JwtPayload): Promise<string> {
    const options: JwtSignOptions = {
      secret: this.auth.accessTokenSecret,
      expiresIn: this.auth.accessTokenTtl,
    };

    return this.jwtService.signAsync<JwtPayload>(payload, options);
  }

  private async signRefreshToken(payload: JwtPayload): Promise<string> {
    const options: JwtSignOptions = {
      secret: this.auth.refreshTokenSecret,
      expiresIn: this.auth.refreshTokenTtl,
    };

    return this.jwtService.signAsync<JwtPayload>(payload, options);
  }
}
