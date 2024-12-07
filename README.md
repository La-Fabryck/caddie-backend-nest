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
docker compose run --rm backend npx prisma migrate dev --name init
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

``` bash
docker compose exec backend node -v
```

## Misceallenous

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

### NVM use the version's project

``` bash
nvm install && nvm use
```

### Clean the packages and dist

``` bash
sudo rm -rf ./node_modules && sudo rm -rf ./dist
```


