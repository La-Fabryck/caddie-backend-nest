# How to install the project

1. Create the network

```bash
docker network create caddie_network
```

2. Pull docker dependencies

```bash
docker compose pull
```

3. Build the Nest image

```bash
docker compose build
```

4. Install the dependencies

```bash
docker compose run --rm backend npm ci
```

or use the makefile

```bash
make install
```

5. Run the migrations

```bash
docker compose run --rm backend npm run db:migrate:latest
```

6. Start the app

```bash
docker compose up
```

7. Check the node version

```bash
docker compose exec backend node -v
```

## Misceallenous

### Create & Restore a dump from prod

To create a dump :

```bash
docker exec -t $CONTAINER_NAME pg_dump -U $DB_USER $DB_NAME > $REMOTE_DIR/db-$TIMESTAMP.sql
```

To restore locally. The DB must be cleaned beforehand, use `docker compose down` or `docker compose down --rmi all` to reset your env. Follow the install steps until Step 4, then adapt and execute :

```bash
docker exec -i caddie-backend-nest-postgres-1 /bin/bash -c "PGPASSWORD=password psql --username postgres caddie_app" < /path/to/dump/file.sql
```

### Clean everything docker related

```bash
docker compose stop \
&& docker compose down -v \
&& docker compose down --rmi all \
&& docker compose rm --volumes \
&& docker builder prune -a \
&& docker image prune -a \
&& docker container prune \
&& docker system prune -a --volumes

docker compose -f docker/app/prod/compose.yml down -v
docker compose -f docker/app/prod/compose.yml down -v --rmi all

This stops all stacks, removes containers, images, build cache, and volumes (including the prod Postgres data volume).

### Reset to dev environment

To tear down prod and dev stacks (containers + volumes) and ensure the dev network is ready, without pruning all Docker images:

```bash
make reset-dev
```

Then start dev with `docker compose up` (and run `npm ci` / migrations in the container if needed).

### Simulate production startup

From a clean slate (e.g. after the steps above):

1. Create the external network (once):

```bash
docker network create caddie_network
```

2. Ensure `.env` has `DATABASE_URL` for the **compose** postgres service (backend runs inside Docker and talks to `postgres:5432`):

```bash
DATABASE_URL="postgresql://postgres:password@postgres:5432/caddie_app?schema=public"
```

3. Start the prod stack and run migrations:

```bash
./docker/app/prod/build.sh
```

The script builds, starts in detached mode, then runs migrations. Without the script (no .dockerignore): `docker compose -f docker/app/prod/compose.yml up --build`; run migrations separately with `docker compose -f docker/app/prod/compose.yml run --rm backend npm run db:migrate:kysely`.

The backend container runs only `npm run start:prod`; migrations are not run on startup. Postgres data persists in the `pgcaddie` volume. To start completely fresh again, run the clean steps above (including `docker/app/prod/compose.yml ... down -v` to remove the volume).

### Update Node alpine

```bash
docker compose build --pull --no-cache
```

### NVM use the version's project

```bash
nvm install && nvm use
```

### Clean the packages and dist

```bash
sudo rm -rf ./node_modules && sudo rm -rf ./dist
```

### Fastify version compatibilty

To ensure Fastify play nice with @nestjs/platform-fastify, we must ensure the version are deduped


```bash
caddie-backend-nest@0.2.0 /home/binbin/Documents/code/caddie/caddie-backend-nest
├─┬ @nestjs/platform-fastify@11.1.6
│ └── fastify@5.4.0 deduped
└── fastify@5.4.0
```

Verify fastify compatibility with :

```bash
npm info @nestjs/platform-fastify dependencies.fastify
```

To update, use the following or the command in the makefile

```bash
npx npm-check-updates -u -i -x fastify --format group
```

### Fastify cookie compatibility

To ensure `@fastify/cookie` uses a compatible `fastify-plugin` version verify compatibility with:
```bash
npm info @fastify/cookie dependencies.fastify-plugin
```

and 

```
❯ npm ls fastify-plugin
├─┬ @fastify/cookie@11.0.2
│ └── fastify-plugin@5.1.0
└─┬ @nestjs/platform-fastify@11.1.6
  ├─┬ @fastify/cors@11.1.0
  │ └── fastify-plugin@5.1.0 deduped
  ├─┬ @fastify/formbody@8.0.2
  │ └── fastify-plugin@5.1.0 deduped
  └─┬ @fastify/middie@9.0.3
    └── fastify-plugin@5.1.0 deduped
```

`@fastify/cookie` needs to match the version required

## Start the Test debugger with Docker

1. Start the app with `docker compose up`
2. Start the `Debug Jest E2E Tests` debugger
3. Run the test with `docker compose exec backend npm run test:debug`
