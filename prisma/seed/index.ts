import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { insertItems } from './items';
import { insertLists } from './lists';
import { insertUsers } from './users';

const prisma = new PrismaClient();

async function main() {
  const uuids = [
    'c9a2553e-3d77-4c07-931a-b1b3a074aa61',
    faker.string.uuid(),
    faker.string.uuid(),
    faker.string.uuid(),
    faker.string.uuid(),
  ];

  await prisma.item.deleteMany();
  console.log('Removed all items');

  await prisma.subscriber.deleteMany();
  console.log('Removed all subscribers');

  await prisma.list.deleteMany();
  console.log('Removed all lists');

  await prisma.user.deleteMany();
  console.log('Removed all users');

  await insertUsers(prisma, uuids);
  const listsIds = await insertLists(prisma, uuids);
  await insertItems(prisma, listsIds);
}
main()
  .then(() => {
    console.log('Seed completed !');
  })
  .catch((e: unknown) => {
    console.error(e);
  })
  .finally(() => {
    void (async () => {
      await prisma.$disconnect();
    })();
  });
