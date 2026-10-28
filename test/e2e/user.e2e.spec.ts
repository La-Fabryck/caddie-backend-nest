import { HttpStatus } from '@nestjs/common';
import type { NestNodeApplication } from '@nestjs/platform-node';
import request from 'supertest';
import type { ErrorInterface } from '@/app.configurator';
import type { UserRow } from '@/database/database-types';
import type { CreateUserDto } from '@/users/dto/create-user.dto';
import { UsersService } from '@/users/users/users.service';
import { resourceCreator } from 'test/creator/resource-creator';
import { createUser } from 'test/factories/user';
import { createAppE2E } from 'test/support/create-app.e2e';

describe('UserController (e2e)', () => {
  let app: NestNodeApplication;

  beforeAll(async () => {
    app = await createAppE2E();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users (POST) - OK - Creates a user', async () => {
    const fakeUser: CreateUserDto = createUser();

    const result = await request(app.getHttpServer()).post('/users').send(fakeUser);

    expect(result.status).toEqual(HttpStatus.CREATED);

    const response = JSON.parse(result.text) as UserRow;
    expect(response.email).toEqual(fakeUser.email);
    expect(response.name).toEqual(fakeUser.name);

    await app.get(UsersService).remove(response.id);
  });

  it('/users (POST) - KO - Fails validation', async () => {
    const result = await request(app.getHttpServer()).post('/users').send({});

    expect(result.status).toEqual(HttpStatus.BAD_REQUEST);

    const response = JSON.parse(result.text) as ErrorInterface;
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

    const result = await request(app.getHttpServer()).post('/users').send(creator.user);

    expect(result.status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);

    const response = JSON.parse(result.text) as ErrorInterface;
    expect(response).toStrictEqual({
      email: [{ message: 'USER_EMAIL_NOT_UNIQUE' }],
    });
  });
});
