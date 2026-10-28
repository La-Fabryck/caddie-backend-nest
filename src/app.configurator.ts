import { BadRequestException, type INestApplication, StandardSchemaValidationPipe } from '@nestjs/common';

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

function configureApp(app: INestApplication): void {
  app.useSecurityHeaders();

  app.useGlobalPipes(
    new StandardSchemaValidationPipe({
      exceptionFactory: (issues): BadRequestException => {
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
