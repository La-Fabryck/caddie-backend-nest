import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { ErrorInterface } from '@/app.configurator';
import type { JwtPayload } from '@/users/authentication/authentication.service';
import type { LoginDto } from '@/users/dto/login.dto';
import { resourceCreator } from 'test/creator/resource-creator';
import { createUser } from 'test/factories/user';
import { createAppE2E } from 'test/support/create-app.e2e';

describe('AuthenticationController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createAppE2E();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/authentication/login (POST) - OK - Log in the user', async () => {
    await using creator = await resourceCreator(app, { loginUser: false });
    const login: LoginDto = creator.user;

    const result = await app.inject({
      method: 'POST',
      url: '/authentication/login',
      body: login,
    });

    expect(result.statusCode).toEqual(HttpStatus.OK);

    expect(result.payload).toBeFalsy();

    const accessCookie = result.cookies.find((cookie) => cookie.name === 'SESSION_ID');
    expect(accessCookie).not.toBeFalsy();
    expect(accessCookie?.httpOnly).toBe(true);
    expect(accessCookie?.sameSite).toBe('Strict');
    expect(accessCookie?.secure).toBe(true);
    expect(accessCookie?.['path']).toBe('/');

    const refreshCookie = result.cookies.find((cookie) => cookie.name === 'SESSION_REFRESH_ID');
    expect(refreshCookie).not.toBeFalsy();
    expect(refreshCookie?.httpOnly).toBe(true);
    expect(refreshCookie?.sameSite).toBe('Strict');
    expect(refreshCookie?.secure).toBe(true);
    expect(refreshCookie?.['path']).toBe('/');

    const jwtService = app.get(JwtService);
    const jwt = jwtService.verify<JwtPayload>(accessCookie?.value ?? '');
    expect(jwt.sub).toBe(creator.user.id);
  });

  it('/authentication/refresh (POST) - OK - refreshes access token', async () => {
    await using creator = await resourceCreator(app, { loginUser: false });
    const login: LoginDto = creator.user;

    const loginResult = await app.inject({
      method: 'POST',
      url: '/authentication/login',
      body: login,
    });

    const loginAccessCookie = loginResult.cookies.find((cookie) => cookie.name === 'SESSION_ID');
    const refreshCookie = loginResult.cookies.find((cookie) => cookie.name === 'SESSION_REFRESH_ID');
    expect(loginAccessCookie).not.toBeFalsy();
    expect(refreshCookie).not.toBeFalsy();

    const refreshTokenBefore = refreshCookie?.value ?? '';

    const result = await app.inject({
      method: 'POST',
      url: '/authentication/refresh',
      cookies: {
        SESSION_REFRESH_ID: refreshTokenBefore,
      },
    });

    expect(result.statusCode).toEqual(HttpStatus.OK);

    const accessCookieAfter = result.cookies.find((cookie) => cookie.name === 'SESSION_ID');
    const refreshCookieAfter = result.cookies.find((cookie) => cookie.name === 'SESSION_REFRESH_ID');
    expect(accessCookieAfter).not.toBeFalsy();
    expect(refreshCookieAfter).not.toBeFalsy();

    // Stateless refresh echoes the same refresh token string.
    expect(refreshCookieAfter?.value).toEqual(refreshTokenBefore);

    const jwtService = app.get(JwtService);
    const jwt = jwtService.verify<JwtPayload>(accessCookieAfter?.value ?? '');
    expect(jwt.sub).toBe(creator.user.id);

    // Access JWT strings can still match login when both are issued in the same Unix second (iat resolution).
    const accessBefore = jwtService.decode<JwtPayload>(loginAccessCookie?.value ?? '');
    const accessAfter = jwtService.decode<JwtPayload>(accessCookieAfter?.value ?? '');
    expect(accessAfter.sub).toBe(creator.user.id);
    // If `iat` is missing on the login token, fail instead of vacuously passing (`?? 0` would allow any non-negative iat).
    expect(accessAfter.iat).toBeGreaterThanOrEqual(accessBefore.iat ?? Infinity);
  });

  it('/authentication/login (POST) - KO - Fails validation', async () => {
    const result = await app.inject({
      method: 'POST',
      url: '/authentication/login',
      body: {},
    });

    expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST);

    const response = JSON.parse(result.body) as ErrorInterface;
    expect(response).toStrictEqual({ email: [{ message: 'INVALID_EMAIL' }], password: [{ message: 'INVALID_PASSWORD' }] });
  });

  it('/authentication/login (POST) - KO - User does not exists', async () => {
    const result = await app.inject({
      method: 'POST',
      url: '/authentication/login',
      body: createUser(),
    });

    expect(result.statusCode).toEqual(HttpStatus.FORBIDDEN);

    const response = JSON.parse(result.body) as ErrorInterface;
    expect(response).toStrictEqual({ root: [{ message: 'INVALID_LOGIN' }] });
  });
});
