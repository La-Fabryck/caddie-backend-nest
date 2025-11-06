import { faker } from '@faker-js/faker';
import { type User } from '@prisma/client';
import { type CreateList } from '@/shopping/list/list.service';

function createList(user: User, overrides: Partial<CreateList> = {}): CreateList {
  return {
    title: faker.food.dish(),
    pseudonym: faker.person.fullName(),
    user: user,
    ...overrides,
  };
}

function createManyLists(user: User, count: number): CreateList[] {
  return Array.from({ length: count }, () => createList(user));
}

export { createList, createManyLists };
