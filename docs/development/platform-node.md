# HTTP adapter

The app runs on `@nestjs/platform-node` (`NodeAdapter`, `node:http`). Nest still defaults to Express until v13, so `main.ts` passes `new NodeAdapter()` explicitly. `app.listen(port, host)` is the Nest signature.

## Cookies

Login, refresh, and logout write through `HttpAdapterHost.httpAdapter.setCookie()` and `clearCookie()`. `maxAge` stays in seconds and `sameSite` is `'strict'`. Refresh reads with `@Cookies()`. The guard reads the `Cookie` header with `cookie.parse` (`readRequestCookie`), because `@Cookies()` only runs on route parameters.

Do not call `NodeResponse.cookie()`. That helper takes `maxAge` in milliseconds, so today's second values become `Max-Age=0`.

## E2E

`createAppE2E` calls `app.init()` and the specs use [Supertest](https://docs.nestjs.com/fundamentals/testing#end-to-end-testing) on `app.getHttpServer()`. `Set-Cookie` is parsed in `test/support/http.ts` so the auth spec can keep checking `sameSite`, `httpOnly`, `secure`, `path`, and `maxAge`.

## Security headers

`configureApp` calls [`app.useSecurityHeaders()`](https://docs.nestjs.com/security/helmet) with no options. That call is adapter-neutral.
