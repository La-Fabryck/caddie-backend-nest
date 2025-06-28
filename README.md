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

`fastify`'s installed version must match the one installed in `@nestjs/platform-fastify`

```bash
> npm ls fastify
caddie-backend-nest@0.0.1 /path/to/project/caddie-backend-nest
├─┬ @nestjs/platform-fastify@10.4.15
│ └── fastify@4.28.1 deduped
└── fastify@4.28.1
```

Install one that's matching

### Fastify cookie compatibility

Check in the `package-lock.json` the version of `fastify-plugin` in the dependencies of `@fastify/cookie`.
For example here it means it's compatible with fastify v4.

```
    "node_modules/@fastify/cookie": {
      "version": "9.4.0",
      "resolved": "https://registry.npmjs.org/@fastify/cookie/-/cookie-9.4.0.tgz",
      "integrity": "sha512-Th+pt3kEkh4MQD/Q2q1bMuJIB5NX/D5SwSpOKu3G/tjoGbwfpurIMJsWSPS0SJJ4eyjtmQ8OipDQspf8RbUOlg==",
      "dependencies": {
        "cookie-signature": "^1.1.0",
        "fastify-plugin": "^4.0.0" <------------
      }
    },
```
