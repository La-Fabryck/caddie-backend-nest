import { faker } from '@faker-js/faker';
import type { UserRow } from '@/database/database-types';
import type { CreateList } from '@/shopping/list/list.service';

function createList(user: UserRow, overrides: Partial<CreateList> = {}): CreateList {
  return {
    title: faker.food.dish(),
    pseudonym: faker.person.fullName(),
    user: user,
    ...overrides,
  };
}

function createManyLists(user: UserRow, count: number): CreateList[] {
  return Array.from({ length: count }, () => createList(user));
}

export { createList, createManyLists };
