import { type NestFastifyApplication } from '@nestjs/platform-fastify';
import { type User } from '@prisma/client';
import { type InjectOptions, type Response } from 'light-my-request';
import { ListService, type ListWithSubs } from '@/shopping/list/list.service';
import { UsersService } from '@/users/users/users.service';
import { createManyLists } from 'test/factories/list';
import { createUser } from '../factories/user';

type Options = {
  loginUser?: boolean;
  listQuantity?: number;
};

type ResourceCreator = {
  user: User;
  lists: ListWithSubs[];
  cookies: NonNullable<InjectOptions['cookies']>;
  [Symbol.asyncDispose]: () => Promise<void>;
};

function stringfyCookieArray(cookies: Response['cookies']): ResourceCreator['cookies'] {
  const cookiesObject: Record<string, string> = {};

  for (const cookie of cookies) {
    cookiesObject[cookie.name] = cookie.value;
  }

  return cookiesObject;
}

async function resourceCreator(
  app: NestFastifyApplication,
  { loginUser = true, listQuantity = 0 }: Options = {},
): Promise<ResourceCreator> {
  const userPayload = createUser();
  const usersService = app.get(UsersService);
  const user = await usersService.create(userPayload);

  let cookies: ResourceCreator['cookies'] = {};
  if (loginUser) {
    const { cookies: userAuth } = await app.inject({
      method: 'POST',
      url: '/authentication/login',
      body: userPayload,
    });

    cookies = stringfyCookieArray(userAuth);
  }

  const lists: ListWithSubs[] = [];
  if (listQuantity) {
    const listService = app.get(ListService);
    const createLists = createManyLists(user, listQuantity);
    const insertedLists = await Promise.all(createLists.map(async (list) => listService.create(list)));
    lists.push(...insertedLists);
  }

  return {
    user: { ...user, password: userPayload.password },
    lists,
    cookies,
    [Symbol.asyncDispose]: async () => {
      return usersService.remove(user.id);
    },
  };
}

export { resourceCreator };
