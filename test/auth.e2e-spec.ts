import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type NestFastifyApplication } from '@nestjs/platform-fastify';
import { type ErrorInterface } from '@/app.configurator';
import { type JwtPayload } from '@/users/authentication/authentication.service';
import { createAppE2E } from './create-app.e2e';
import { resourceCreator } from './creator/resource-creator';
import { createUser } from './factories/user';

describe('AuthenticationController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createAppE2E();
    await app.getHttpAdapter().getInstance().ready();
  });

  it('/authentication/login (POST) - OK - Log in the user', async () => {
    await using creator = await resourceCreator(app);

    const result = await app.inject({
      method: 'POST',
      url: '/authentication/login',
      body: creator.user,
    });

    expect(result.statusCode).toEqual(HttpStatus.OK);

    expect(result.payload).toBeFalsy();

    const authCookie = result.cookies.find((cookie) => cookie.name === 'SESSION_ID');
    expect(authCookie).not.toBeFalsy();
    expect(authCookie?.httpOnly).toBe(true);
    expect(authCookie?.sameSite).toBe('Strict');
    expect(authCookie?.secure).toBe(true);
    expect(authCookie?.['path']).toBe('/');

    const jwtService = app.get(JwtService);
    const jwt = jwtService.verify<JwtPayload>(authCookie?.value ?? '');
    expect(jwt.sub).toBe(creator.user.id);
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

  afterAll(async () => {
    await app.close();
  });
});
