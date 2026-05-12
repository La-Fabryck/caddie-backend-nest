import { registerAs } from '@nestjs/config';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { MAX_TCP_PORT, MIN_TCP_PORT } from './tcp-port-bounds';
import { validateWithClass } from './validate-with-class';

export type AppConfig = {
  nodeEnv: 'development' | 'production' | 'test';
  listenHost: string;
  listenPort: number;
};

class AppConfigDto {
  @IsIn(['development', 'production', 'test'])
  nodeEnv!: AppConfig['nodeEnv'];

  @IsString()
  @IsNotEmpty()
  listenHost!: string;

  @Type(() => Number)
  @IsInt()
  @Min(MIN_TCP_PORT)
  @Max(MAX_TCP_PORT)
  listenPort!: number;
}

export default registerAs('app', (): AppConfig => {
  const plain: Record<string, unknown> = {
    nodeEnv: process.env['NODE_ENV'],
    listenHost: process.env['NEST_IP'],
    listenPort: process.env['NEST_PORT'],
  };

  return validateWithClass(AppConfigDto, plain, 'App configuration validation failed');
});
