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

4. Install the dependencies and generate the prisma schemes

```bash
docker compose run --rm backend npm ci \
&& docker compose run --rm backend npx prisma generate
```

or use the makefile

```bash
make install
```

5. Run the migrations

```bash
docker compose run --rm backend npx prisma migrate dev
```

6. Seed the database

```bash
docker compose run --rm backend npx prisma db seed
```

7. Start the app

```bash
docker compose up
```

8. Check the node version

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
```

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
