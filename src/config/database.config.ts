import { registerAs } from '@nestjs/config';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { MAX_TCP_PORT, MIN_TCP_PORT } from './tcp-port-bounds';
import { validateWithClass } from './validate-with-class';

export type DatabaseConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

class DatabaseConfigDto {
  @IsString()
  @IsNotEmpty()
  host!: string;

  @Type(() => Number)
  @IsInt()
  @Min(MIN_TCP_PORT)
  @Max(MAX_TCP_PORT)
  port!: number;

  @IsString()
  @IsNotEmpty()
  user!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  database!: string;
}

export default registerAs('database', (): DatabaseConfig => {
  const plain: Record<string, unknown> = {
    host: process.env['POSTGRES_HOST'],
    port: process.env['POSTGRES_PORT'],
    user: process.env['POSTGRES_USER'],
    password: process.env['POSTGRES_PASSWORD'],
    database: process.env['POSTGRES_DB'],
  };

  return validateWithClass(DatabaseConfigDto, plain, 'Database configuration validation failed');
});
