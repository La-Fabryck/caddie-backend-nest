import { Injectable, OnModuleInit } from '@nestjs/common';
import { type Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel> implements OnModuleInit {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  //The onModuleInit is optional — if you leave it out, Prisma will connect lazily on its first call to the database.
  async onModuleInit() {
    await this.$connect();
    this.$on('query', ({ query, params, duration }) => {
      console.log('Query: ' + query);
      console.log('Params: ' + params);
      console.log('Duration: ' + duration + 'ms');
    });
  }
}
