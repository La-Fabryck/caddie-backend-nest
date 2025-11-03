import { type INestApplication } from '@nestjs/common';
import { type User } from '@prisma/client';
import { UsersService } from '@/users/users/users.service';
import { createUser } from '../factories/user';

interface ResourceCreator {
  user: User;
  [Symbol.asyncDispose]: () => Promise<void>;
}

async function resourceCreator(app: INestApplication): Promise<ResourceCreator> {
  const userPayload = createUser();
  const usersService = app.get(UsersService);
  const user = await usersService.create(userPayload);

  return {
    user: { ...userPayload, id: user.id },
    [Symbol.asyncDispose]: async () => {
      return usersService.remove(user.id);
    },
  };
}

export { resourceCreator };
