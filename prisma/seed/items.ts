import { faker } from '@faker-js/faker';
import { type Item, type PrismaClient } from '@prisma/client';

function createOneItem(listId: string): Item {
  return {
    id: faker.string.uuid(),
    listId,
    name: faker.lorem.word(),
  };
}

export async function insertItems(prisma: PrismaClient, uuids: string[]) {
  const items: Item[] = [];

  uuids.forEach((uuid) => {
    const itemsToCreateForList = faker.number.int({ min: 1, max: 10 });
    for (let i = 0; i <= itemsToCreateForList; i++) {
      items.push(createOneItem(uuid));
    }
  });

  await prisma.item.createMany({
    data: items,
  });

  console.log('Inserted items in lists');
}
