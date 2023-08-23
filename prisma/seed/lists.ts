import { faker } from '@faker-js/faker';
import { List, PrismaClient } from '@prisma/client';

export async function insertLists(prisma: PrismaClient, uuids: string[]) {
  const lists: List[] = [
    { ...createOneList(uuids[0]), id: 'a347a2d7-c40a-4c19-9c6c-f8c84144cd1c' },
  ];

  uuids.forEach((uuid) => {
    const listsToCreateForUser = faker.number.int({ min: 1, max: 10 });
    for (let i = 0; i <= listsToCreateForUser; i++) {
      lists.push(createOneList(uuid));
    }
  });

  await prisma.list.createMany({
    data: lists,
  });

  console.log('Inserted lists for users');

  return lists.map((list) => list.id);
}

function createOneList(authorId: string): List {
  return {
    id: faker.string.uuid(),
    authorId,
    title: faker.lorem.slug(),
  };
}
