# Dependency management

## Use Make targets first

```bash
make update
```

- `make update`: runs `update-dependencies`, then `update-lockfile`.
- `make update-dependencies`: interactive upgrade with a lint and e2e gate.
- `make update-lockfile`: refreshes the lockfile and runs the same gate.

The HTTP adapter is `@nestjs/platform-node`. Session cookies use Nest's built-in cookie API (`setCookie`, `clearCookie`, `@Cookies()`). `ncu` skips `cookie` and `@types/cookie`. `make sync-cookie` (also run at the end of `make update-dependencies` and during `make update-lockfile`) installs the `cookie` version that this repo's `@nestjs/platform-node` range depends on. cookie 2.x renames `parse`, so that sync fails typecheck until `readRequestCookie` is updated in the same change.
