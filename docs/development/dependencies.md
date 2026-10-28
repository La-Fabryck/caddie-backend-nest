# Dependency management

## Use Make targets first

```bash
make update
```

- `make update`: runs `update-dependencies`, then `update-lockfile`.
- `make update-dependencies`: interactive upgrade with a lint and e2e gate.
- `make update-lockfile`: refreshes the lockfile and runs the same gate.

The HTTP adapter is `@nestjs/platform-node`. Session cookies use Nest's built-in cookie API (`setCookie`, `clearCookie`, `@Cookies()`). `ncu` skips `cookie` and `@types/cookie`. `make sync-cookie` runs inside `make update-lockfile`, after that task writes the lockfile. It installs the `cookie` version declared by the `@nestjs/platform-node` entry in `package-lock.json`. cookie 2.x renames `parse`, so that sync fails typecheck until `readRequestCookie` is updated in the same change.
