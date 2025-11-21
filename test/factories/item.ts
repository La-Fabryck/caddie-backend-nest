import { faker } from '@faker-js/faker';
import type { CreateItemDto } from '@/shopping/dto/create-item.dto';
import type { CreateItem } from '@/shopping/item/item.service';

function createItem(listId: string, overrides: Partial<CreateItemDto> = {}): CreateItem['createItemPayload'] {
  return {
    listId,
    name: faker.food.ingredient(),
    ...overrides,
  };
}

function createManyItems(listId: string, count: number): CreateItem['createItemPayload'][] {
  return Array.from({ length: count }, () => createItem(listId));
}

export { createItem, createManyItems };
