import { HttpStatus } from '@nestjs/common';
import type { ErrorInterface } from '@/app.configurator';
import type { UserRow } from '@/database/database-types';
import type { CreateUserDto } from '@/users/dto/create-user.dto';
import { UsersService } from '@/users/users/users.service';
import { resourceCreator } from 'test/creator/resource-creator';
import { createUser } from 'test/factories/user';
import { createAppE2E, type E2EApplication } from 'test/support/create-app.e2e';

describe('UserController (e2e)', () => {
  let app: E2EApplication;

  beforeAll(async () => {
    app = await createAppE2E();
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

    const response = JSON.parse(result.payload) as UserRow;
    expect(response.email).toEqual(fakeUser.email);
    expect(response.name).toEqual(fakeUser.name);

    await app.get(UsersService).remove(response.id);
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

    expect(result.statusCode).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);

    const response = JSON.parse(result.payload) as ErrorInterface;
    expect(response).toStrictEqual({
      email: [{ message: 'USER_EMAIL_NOT_UNIQUE' }],
    });
  });
});
