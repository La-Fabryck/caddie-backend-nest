# HTTP adapter

The app runs on `@nestjs/platform-node` (`NodeAdapter`, `node:http`). Nest still defaults to Express until v13, so `main.ts` passes `new NodeAdapter()` explicitly. `app.listen(port, host)` is the Nest signature.

## Cookies

Login, refresh, and logout write through `HttpAdapterHost.httpAdapter.setCookie()` and `clearCookie()`. `maxAge` stays in seconds and `sameSite` is `'strict'`. Refresh reads with `@Cookies()`. The guard reads the `Cookie` header with `readRequestCookie`, because `@Cookies()` only runs on route parameters.

Do not call `NodeResponse.cookie()`. That helper takes `maxAge` in milliseconds, so today's second values become `Max-Age=0`.

## E2E

`NodeAdapter` has no `inject` and no Fastify `ready()`. `createAppE2E` listens on `127.0.0.1` with port `0` and `app.inject` sends the request with `fetch`. `Set-Cookie` is parsed in `test/support/inject-e2e.ts` so the auth spec can keep checking `sameSite`, `httpOnly`, `secure`, `path`, and `maxAge`.

## Security headers

`configureApp` calls [`app.useSecurityHeaders()`](https://docs.nestjs.com/security/helmet) with no options. That call is adapter-neutral.
