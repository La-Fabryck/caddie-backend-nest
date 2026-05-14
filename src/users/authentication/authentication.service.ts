import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
// Nest DI needs `JwtService` as a runtime value for `emitDecoratorMetadata` / param types.
// eslint-disable-next-line typescript/consistent-type-imports -- Nest DI: JwtService must stay a value import
import {
  JwtService,
  type JwtSignOptions,
  TokenExpiredError,
} from '@nestjs/jwt';
import { compare } from 'bcrypt';
import type { JwtPayload as JwtRegisteredClaims } from 'jsonwebtoken';
import type { ErrorInterface } from '@/app.configurator';
import type { AuthConfig } from '@/config/auth.config';
import type { LoginDto } from '../dto/login.dto';
import { INVALID_LOGIN } from '../messages/authentication';
import type { UsersService } from '../users/users.service';

/**
 * Application subject (`sub`) plus standard JWT registered claims (`iat`, `exp`, …) from `jsonwebtoken`.
 */
type JwtPayload = JwtRegisteredClaims & {
  sub: string;
};
type AuthTokens = { accessToken: string; refreshToken: string };

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
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(payload),
      this.signRefreshToken(payload),
    ]);

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
        const message = `Refresh token expired at ${String(error.expiredAt)}`;
        this.logger.log(message);
      } else if (error instanceof Error) {
        this.logger.warn(
          `Refresh token verification failed: ${error.name}, cause : ${error.cause}`,
        );
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

export type { AuthTokens, JwtPayload };
