import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { insertUsers } from './users';
import { insertLists } from './lists';
import { insertItems } from './items';

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

  await prisma.list.deleteMany();
  console.log('Removed all lists');

  await prisma.user.deleteMany();
  console.log('Removed all users');

  await insertUsers(prisma, uuids);
  const listsIds = await insertLists(prisma, uuids);
  await insertItems(prisma, listsIds);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
