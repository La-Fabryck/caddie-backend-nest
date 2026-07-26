import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kysely, type LogEvent, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { DatabaseConfig } from '@/config/database.config';
import type { DB } from './database-types';

const QUERY_DURATION_DECIMALS = 1;

@Injectable()
export class DatabaseService extends Kysely<DB> implements OnModuleDestroy {
  constructor(configService: ConfigService) {
    // Must create before `super()` — `this` is unavailable until then.
    const logger = new Logger(DatabaseService.name);
    const database = configService.getOrThrow<DatabaseConfig>('database');

    const pool = new Pool({
      host: database.host,
      port: database.port,
      user: database.user,
      password: database.password,
      database: database.database,
      max: 10,
    });

    super({
      dialect: new PostgresDialect({ pool }),
      log(event: LogEvent): void {
        const duration = `${event.queryDurationMillis.toFixed(QUERY_DURATION_DECIMALS)}ms`;
        if (event.level === 'error') {
          const stack = event.error instanceof Error ? event.error.stack : undefined;
          logger.error(`Query failed (${duration}): ${event.query.sql}`, stack);
        } else {
          logger.log(`Query (${duration}): ${event.query.sql}`);
        }
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.destroy();
  }
}
