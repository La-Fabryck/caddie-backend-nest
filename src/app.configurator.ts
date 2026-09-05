import { fastifyCookie } from '@fastify/cookie';
import { BadRequestException, StandardSchemaValidationPipe } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

type ErrorInterfaceBody = { message: string };
export type ErrorInterface = Record<string, ErrorInterfaceBody[]>;

/**
 * Maps a Standard Schema issue path to an ErrorInterface key (`email`, `items.0.name`).
 * No path → `root` (whole-value errors). Segments are a PropertyKey or `{ key }`.
 */
function issuePathKey(path: readonly (PropertyKey | { key: PropertyKey })[] | undefined): string {
  if (path == null || path.length === 0) {
    return 'root';
  }
  return path.map((segment) => String(typeof segment === 'object' ? segment.key : segment)).join('.');
}

async function configureApp(app: NestFastifyApplication): Promise<void> {
  await app.register(fastifyCookie);

  app.useGlobalPipes(
    new StandardSchemaValidationPipe({
      exceptionFactory: (issues) => {
        const result: ErrorInterface = {};
        for (const issue of issues) {
          const key = issuePathKey(issue.path);
          (result[key] ??= []).push({ message: issue.message });
        }
        return new BadRequestException(result);
      },
    }),
  );
}
export { configureApp };
