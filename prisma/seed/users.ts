import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { genSaltSync, hashSync } from 'bcrypt';

export async function insertUsers(prisma: PrismaClient, uuids: string[]) {
  await prisma.user.createMany({
    data: uuids.map((uuid) => {
      return {
        id: uuid,
        email: faker.internet.email(),
        name: faker.internet.userName(),
        password: hashSync('ALongPassw0rdOf30Characters_%/', genSaltSync()),
      };
    }),
  });

  console.log(`Inserted users with IDs : ${uuids.join(', ')}.`);
}
