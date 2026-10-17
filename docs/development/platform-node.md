# HTTP adapter notes

Findings as of 15 October 2026. This is a record for a later change, not a task list.

`@nestjs/platform-node` is not published. Do not start the adapter migration, and do not build against the draft pull request, until the package ships in a Nest minor release.

## Leaving Fastify

Nest announced a native HTTP adapter, `@nestjs/platform-node`, built on `node:http`, for the next minor release ([post](https://x.com/nestframework/status/2109575242121449478), [draft PR #18063](https://github.com/nestjs/nest/pull/18063)). The latest published Nest line is 12.1.3, which this repo already uses. The package is not on npm. Express and Fastify stay supported.

The advertised switch is one line:

```ts
const app = await NestFactory.create(AppModule, new NodeAdapter());
```

That is not this app. `app.listen({ port, host })` in `src/main.ts` is fine on `node:http`. Everything else that assumes Fastify has to move with the adapter:

- `FastifyAdapter` and `NestFastifyApplication` in `src/main.ts` and `test/support/create-app.e2e.ts`
- `app.register()` for `@fastify/cookie` in `src/app.configurator.ts` (`NodeAdapter` has no plugin `register`)
- Direct dependencies `fastify`, `@nestjs/platform-fastify`, `@fastify/cookie`, and the dev dependency `light-my-request`
- `make sync-fastify`, `make versions`, and `ncu --reject fastify` in the Makefile, plus [`dependencies.md`](dependencies.md)

Shopping controllers, Zod pipes, and Kysely do not import Fastify. They stay as they are.

## Impacts

### Cookies

`@fastify/cookie` is what fills `request.cookies`. The draft `NodeRequest` has no `cookies` property, and [Nest's cookie API](https://docs.nestjs.com/techniques/cookies) never assigns `req.cookies` itself. Drop the plugin and these reads go empty until they use `@Cookies()` or parse the `Cookie` header:

- `src/users/authentication/authentication.controller.ts` (`refresh`)
- `src/users/guards/authentication.guard.ts`

Writes go through `reply.cookie()`, `reply.clearCookie()`, and `CookieSerializeOptions` from `@fastify/cookie`. `maxAge` here is seconds (`msDurationToSeconds`). `@fastify/cookie` and Nest's `setCookie()` both use seconds. The draft `NodeResponse.cookie()` is Express-shaped: `maxAge` is milliseconds, then divided by 1000. Passing today's options through that helper turns a 900-second access token into `Max-Age=0`. `sameSite: true` (Strict) is also not in Nest's `CookieSerializeOptions` (`'strict' | 'lax' | 'none'`).

### Request fields

The authenticated user is not on the Fastify request. `src/users/authentication/auth-storage.ts` keeps `userId` and `user` in one Node `AsyncLocalStorage`. `AppModule` enters an empty store for `*path`. The guard writes `userId` after it verifies the access token. `AuthenticationInterceptor` writes `user`. `CurrentUser` reads `user`. Shopping controllers only receive `@CurrentUser()`.

The guard still types the request as `FastifyRequest` to read `request.cookies`. That read moves with the cookie change above. There is no request augmentation for `userId` or `user`.

### E2E

Six specs plus `test/creator/resource-creator.ts` call `app.inject` (106 calls, about 73 tests). That method exists because the Fastify adapter wraps `light-my-request`. `NodeAdapter` has no `inject`.

Every spec also calls `app.getHttpAdapter().getInstance().ready()` in `beforeAll`. That is Fastify's `ready()`.

The call shape is stable: `method` (`GET`, `POST`, `PATCH`, `DELETE`), `url` (query string inlined, as in `/list?limit=…`), optional `body` object, optional `cookies` map. No custom headers. Most assertions are `statusCode` and `JSON.parse(result.payload)`. Auth failure cases use `result.body` instead of `payload`.

Only `test/e2e/auth.e2e.spec.ts` and `resource-creator` depend on `light-my-request` parsing `Set-Cookie` into objects (`name`, `value`, `httpOnly`, `sameSite`, `secure`, `path`, `maxAge`). The auth spec expects `sameSite === 'Strict'`. A client that returns raw `set-cookie` strings needs a small parser to keep those checks. `logout` / `clearCookie` has no e2e coverage. No spec asserts security headers.

## Security headers

`configureApp` calls [`app.useSecurityHeaders()`](https://docs.nestjs.com/security/helmet) with no options. Nest writes Helmet 8's default headers itself, on the Fastify adapter's `onRequest` hook. Nothing in the tests checks those headers.

That call is already adapter-neutral, so the platform-node switch does not need another headers change.
