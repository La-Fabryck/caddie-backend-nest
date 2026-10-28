# Dependency management

## Use Make targets first

```bash
make update
```

- `make update`: runs `update-dependencies`, then `update-lockfile`.
- `make update-dependencies`: interactive upgrade with a lint and e2e gate.
- `make update-lockfile`: refreshes the lockfile and runs the same gate.

The HTTP adapter is `@nestjs/platform-node`. Session cookies use Nest's built-in cookie API (`setCookie`, `clearCookie`, `@Cookies()`).
