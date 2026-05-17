# Testing and debugger

## E2E in Docker (`make ci-e2e`)

```bash
make ci-e2e
```

Builds the Alpine test image, starts Postgres + the API (`npm start` in the `test` service), then runs Jest with `compose exec test npm run test:e2e`. Config is baked from [`docker/app/e2e/.env.e2e`](../../docker/app/e2e/.env.e2e).

Specs still use `createAppE2E` today (in-process Nest); the running container is the stack you exec into. Switch specs to HTTP against `http://test:3001` when you want tests to hit that API only.

|                  | Dev (`compose.yml`) | E2E (`docker/app/e2e/`) |
| ---------------- | ------------------- | ----------------------- |
| Compose project  | default             | `caddie-e2e`            |
| Postgres on host | `5432`              | none (internal only)    |
| Database name    | `caddie_app`        | `caddie_e2e`            |

Tear down: `make ci-e2e-down`.

`make update-doctor` runs `compose build` once, then **`make e2e-up`** (Postgres → migrate → API), then **`make ncu-doctor-test`** after each upgrade: lint on the host, `npm ci` + Jest via `compose exec` (mounted lockfiles; no image rebuild).

## E2E on host (local dev)

For a single spec or watch mode, use dev Postgres and Jest on the host:

1. `docker compose up -d`
2. `npm run db:migrate:latest` (do not use `caddie_app` as the test DB)
3. `npm run test:e2e` or `npm run test:e2e -- test/e2e/user.e2e-spec.ts`

Use the **Debug: Caddie** launch configuration for the app (local Node).

For Jest debug on host: **Debug Jest E2E Tests** or `npm run test:debug`.

## Debug Jest e2e in Docker (optional)

Attach the debugger to port `9230` while the test container runs:

```bash
docker compose -p caddie-e2e -f docker/app/e2e/compose.yml run --rm --service-ports test npm run test:debug
```

Then attach on `localhost:9230`.
