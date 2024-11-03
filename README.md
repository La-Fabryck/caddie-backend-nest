docker network create caddie_network

docker compose pull

docker compose build --pull backend

docker compose run --rm backend npm ci

docker compose run --rm backend npx prisma generate

docker compose run --rm backend npx prisma migrate dev --name init