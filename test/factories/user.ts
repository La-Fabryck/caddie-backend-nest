import { faker } from '@faker-js/faker';
import type { UserRow } from '@/database/database-types';

function createUser(overrides: Partial<UserRow> = {}): UserRow {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: `Ab1%${faker.internet.password({ length: 12 })}`,
    ...overrides,
  };
}

function createManyUsers(count: number): UserRow[] {
  return Array.from({ length: count }, () => createUser());
}

export { createUser, createManyUsers };
