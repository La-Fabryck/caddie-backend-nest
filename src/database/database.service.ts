import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Kysely, type LogConfig, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { AppConfig } from '@/config/app.config';
import type { DatabaseConfig } from '@/config/database.config';
import type { DB } from './database-types';

@Injectable()
export class DatabaseService extends Kysely<DB> implements OnModuleDestroy {
  constructor(configService: ConfigService) {
    const database = configService.getOrThrow<DatabaseConfig>('database');
    const { nodeEnv } = configService.getOrThrow<AppConfig>('app');

    const pool = new Pool({
      host: database.host,
      port: database.port,
      user: database.user,
      password: database.password,
      database: database.database,
      max: 10,
    });
    const log: LogConfig = nodeEnv === 'test' ? ['error'] : ['query', 'error'];

    super({
      dialect: new PostgresDialect({ pool }),
      log,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.destroy();
  }
}
