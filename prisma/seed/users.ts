import { faker } from '@faker-js/faker';
import { type PrismaClient } from '@prisma/client';
import { genSaltSync, hashSync } from 'bcrypt';

export async function insertUsers(prisma: PrismaClient, uuids: string[]) {
  await prisma.user.createMany({
    data: uuids.map((uuid) => {
      const email = faker.internet.email().toLowerCase();
      console.log('email: ', email);

      return {
        id: uuid,
        email,
        name: faker.internet.username(),
        password: hashSync('ALongPassw0rdOf30Characters_%/', genSaltSync()),
      };
    }),
  });

  console.log(`Inserted users with IDs : ${uuids.join(', ')}.`);
}
