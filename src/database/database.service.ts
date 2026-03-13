import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kysely, type LogConfig, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { DB } from './database-types';

@Injectable()
export class DatabaseService extends Kysely<DB> implements OnModuleDestroy {
  constructor(configService: ConfigService) {
    const port = configService.getOrThrow<string>('POSTGRES_PORT');
    const pool = new Pool({
      host: configService.getOrThrow<string>('POSTGRES_HOST'),
      port: Number.parseInt(port),
      user: configService.getOrThrow<string>('POSTGRES_USER'),
      password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
      database: configService.getOrThrow<string>('POSTGRES_DB'),
      max: 10,
    });
    const log: LogConfig = configService.get<string>('NODE_ENV') === 'test' ? ['error'] : ['query', 'error'];

    super({
      dialect: new PostgresDialect({ pool }),
      log,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.destroy();
  }
}
