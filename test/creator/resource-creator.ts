import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { Item, User } from '@prisma/client';
import type { InjectOptions, Response } from 'light-my-request';
import { ItemService } from '@/shopping/item/item.service';
import { ListService, type ListWithSubs } from '@/shopping/list/list.service';
import { UsersService } from '@/users/users/users.service';
import { createManyItems } from 'test/factories/item';
import { createManyLists } from 'test/factories/list';
import { createUser } from '../factories/user';

function stringfyCookieArray(cookies: Response['cookies']): ResourceCreator['cookies'] {
  const cookiesObject: Record<string, string> = {};

  for (const cookie of cookies) {
    cookiesObject[cookie.name] = cookie.value;
  }

  return cookiesObject;
}

type ScenarioOptions = {
  quantity: number;
  remove: boolean;
};

type Options = {
  loginUser: boolean;
  list: Partial<ScenarioOptions>;
  items: Partial<ScenarioOptions>;
};

type ResourceCreator = {
  user: User;
  lists: ListWithSubs[];
  items: Item[];
  cookies: NonNullable<InjectOptions['cookies']>;
  [Symbol.asyncDispose]: () => Promise<void>;
};

const scenarioDefaults: ScenarioOptions = { quantity: 0, remove: true };

async function resourceCreator(
  app: NestFastifyApplication,
  {
    loginUser = true,
    list: { quantity: listsQuantity = 0, remove: removeLists = true } = scenarioDefaults,
    items: { quantity: itemsQuantity = 0, remove: removeItems = true } = scenarioDefaults,
  }: Partial<Options> = {},
): Promise<ResourceCreator> {
  if (itemsQuantity !== 0 && listsQuantity === 0) {
    throw new Error('Cannot have Items without a List');
  }

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

  const listService = app.get(ListService);
  const lists: ListWithSubs[] = [];
  if (listsQuantity) {
    const creationListsPayload = createManyLists(user, listsQuantity);
    const createdLists = await Promise.all(creationListsPayload.map(async (list) => listService.create(list)));
    lists.push(...createdLists);
  }

  const itemService = app.get(ItemService);
  const items: Item[] = [];
  if (itemsQuantity) {
    const itemCreationPayloads: ReturnType<typeof createManyItems> = lists.flatMap((list) => createManyItems(list.id, itemsQuantity));

    const createdItems = await Promise.all(itemCreationPayloads.map(async (item) => itemService.create({ createItemPayload: item, user })));
    items.push(...createdItems);
  }

  return {
    user: { ...user, password: userPayload.password },
    lists,
    items,
    cookies,
    [Symbol.asyncDispose]: async () => {
      if (removeItems && itemsQuantity) {
        await Promise.all(items.map(async (item) => itemService.remove(item.listId, item.id, user)));
      }
      if (removeLists && listsQuantity) {
        await Promise.all(lists.map(async (list) => listService.remove({ id: list.id, user })));
      }
      return usersService.remove(user.id);
    },
  };
}

export { resourceCreator };
