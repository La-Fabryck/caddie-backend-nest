import { faker } from '@faker-js/faker';
import { List, PrismaClient } from '@prisma/client';

export async function insertLists(prisma: PrismaClient, uuids: string[]) {
  const lists: List[] = [{ ...createOneList(), id: 'a347a2d7-c40a-4c19-9c6c-f8c84144cd1c' }];

  uuids.forEach(() => {
    const listsToCreateForUser = faker.number.int({ min: 1, max: 10 });
    for (let i = 0; i <= listsToCreateForUser; i++) {
      lists.push(createOneList());
    }
  });

  await prisma.list.createMany({
    data: lists,
  });

  console.log('Inserted lists for users');

  return lists.map((list) => list.id);
}

function createOneList(): List {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.slug(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
