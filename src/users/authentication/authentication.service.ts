import { ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions, TokenExpiredError } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import type { JwtPayload as JwtRegisteredClaims } from 'jsonwebtoken';
import { ErrorInterface } from '@/app.configurator';
import { LoginDto } from '../dto/login.dto';
import { INVALID_LOGIN } from '../messages/authentication';
import { UsersService } from '../users/users.service';
import { ACCESS_TOKEN_SECRET, ACCESS_TOKEN_TTL, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_TTL } from '../utils/constants';

/**
 * Application subject (`sub`) plus standard JWT registered claims (`iat`, `exp`, …) from `jsonwebtoken`.
 */
export type JwtPayload = JwtRegisteredClaims & {
  sub: string;
};
export type AuthTokens = { accessToken: string; refreshToken: string };

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  //TODO: message key
  private defaultError: ErrorInterface = {
    root: [{ message: INVALID_LOGIN }],
  };

  async login(loginDto: LoginDto): Promise<AuthTokens> {
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (user == null) {
      throw new ForbiddenException(this.defaultError);
    }

    const isPasswordValid = await compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new ForbiddenException(this.defaultError);
    }

    const payload = { sub: user.id };
    const [accessToken, refreshToken] = await Promise.all([this.signAccessToken(payload), this.signRefreshToken(payload)]);

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.getRefreshTokenSecret(),
      });
    } catch (error: unknown) {
      if (error instanceof TokenExpiredError) {
        const message = `Refresh token expired at ${String(error.expiredAt)}`;
        this.logger.log(message);
      } else if (error instanceof Error) {
        this.logger.warn(`Refresh token verification failed: ${error.name}, cause : ${error.cause}`);
      } else {
        this.logger.error(`Refresh token verification failed: ${error}`);
      }

      throw new UnauthorizedException();
    }

    return {
      accessToken: await this.signAccessToken({ sub: payload.sub }),
      refreshToken,
    };
  }

  private async signAccessToken(payload: JwtPayload): Promise<string> {
    const options: JwtSignOptions = {
      secret: this.getAccessTokenSecret(),
      expiresIn: this.getAccessTokenTtl(),
    };

    return this.jwtService.signAsync<JwtPayload>(payload, options);
  }

  private async signRefreshToken(payload: JwtPayload): Promise<string> {
    const options: JwtSignOptions = {
      secret: this.getRefreshTokenSecret(),
      expiresIn: this.getRefreshTokenTtl(),
    };

    return this.jwtService.signAsync<JwtPayload>(payload, options);
  }

  // FIXME: Better env var handling
  private getAccessTokenSecret(): string {
    return this.configService.getOrThrow<string>(ACCESS_TOKEN_SECRET);
  }

  private getRefreshTokenSecret(): string {
    return this.configService.getOrThrow<string>(REFRESH_TOKEN_SECRET);
  }

  private getAccessTokenTtl(): NonNullable<JwtSignOptions['expiresIn']> {
    return this.configService.getOrThrow<NonNullable<JwtSignOptions['expiresIn']>>(ACCESS_TOKEN_TTL);
  }

  private getRefreshTokenTtl(): NonNullable<JwtSignOptions['expiresIn']> {
    return this.configService.getOrThrow<NonNullable<JwtSignOptions['expiresIn']>>(REFRESH_TOKEN_TTL);
  }
}
