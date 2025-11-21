import { HttpStatus } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { User } from '@prisma/client';
import type { ErrorInterface } from '@/app.configurator';
import type { CreateUserDto } from '@/users/dto/create-user.dto';
import { resourceCreator } from 'test/creator/resource-creator';
import { createUser } from 'test/factories/user';
import { createAppE2E } from 'test/support/create-app.e2e';

describe('UserController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createAppE2E();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users (POST) - OK - Creates a user', async () => {
    const fakeUser: CreateUserDto = createUser();

    const result = await app.inject({
      method: 'POST',
      url: '/users',
      body: fakeUser,
    });

    expect(result.statusCode).toEqual(HttpStatus.CREATED);

    const response = JSON.parse(result.payload) as User;
    expect(response.email).toEqual(fakeUser.email);
    expect(response.name).toEqual(fakeUser.name);
  });

  it('/users (POST) - KO - Fails validation', async () => {
    const result = await app.inject({
      method: 'POST',
      url: '/users',
      body: {},
    });

    expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST);

    const response = JSON.parse(result.payload) as ErrorInterface;
    expect(response).toStrictEqual({
      email: [
        {
          message: 'USER_EMAIL',
        },
      ],
      name: [
        {
          message: 'USER_NAME',
        },
        {
          message: 'USER_NAME',
        },
      ],
      password: [
        {
          message: 'USER_PASSWORD',
        },
      ],
    });
  });

  it('/users (POST) - KO - User already exists', async () => {
    await using creator = await resourceCreator(app, { loginUser: false });

    const result = await app.inject({
      method: 'POST',
      url: '/users',
      body: creator.user,
    });

    expect(result.statusCode).toEqual(HttpStatus.FORBIDDEN);
  });
});
