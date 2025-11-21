import { faker } from '@faker-js/faker';
import type { User } from '@prisma/client';

function createUser(overrides: Partial<User> = {}): User {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: `Ab1%${faker.internet.password({ length: 12 })}`,
    ...overrides,
  };
}

function createManyUsers(count: number): User[] {
  return Array.from({ length: count }, () => createUser());
}

export { createUser, createManyUsers };
