import { faker } from '@faker-js/faker';
import type { UserRow } from '@/database/database-types';
import { USER_NAME_MAX_LENGTH } from '@/users/dto/create-user.dto';

function createUser(overrides: Partial<UserRow> = {}): UserRow {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName().slice(0, USER_NAME_MAX_LENGTH),
    email: faker.internet.email().toLowerCase(),
    password: `Ab1%${faker.internet.password({ length: 12 })}`,
    ...overrides,
  };
}

export { createUser };
