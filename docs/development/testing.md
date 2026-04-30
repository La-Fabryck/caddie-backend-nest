# Testing and debugger

## Run e2e tests with Make

Run all e2e tests:

```bash
make e2e
```

Run e2e tests matching a pattern:

```bash
make e2e p=user
```

Watch mode:

```bash
make e2e-watch
```

## Debug Jest e2e tests in Docker

1. Start the app:

```bash
docker compose up
```

2. Start the `Debug Jest E2E Tests` debugger in your IDE.
3. Run debug tests:

```bash
docker compose exec backend npm run test:debug
```
