#!/usr/bin/env sh

# Prod Docker: copy .dockerignore to repo root, ensure network, start stack (detached), run migrations.
# Run from repo root: ./docker/app/prod/build.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

if [ ! -f "$ROOT_DIR/.env" ]; then
	echo "Error: $ROOT_DIR/.env is missing. Copy .env.sample to .env and set the variables." >&2
	exit 1
fi

cp "$SCRIPT_DIR/.dockerignore" "$ROOT_DIR/.dockerignore"
docker network create caddie_network || true
cd "$ROOT_DIR"

# Compose interpolates ${POSTGRES_*} from an env file; default project dir is the compose file's
# directory, so repo-root .env is ignored unless we pass it explicitly.
docker compose --env-file "$ROOT_DIR/.env" -f docker/app/prod/compose.yml up -d --build
docker compose --env-file "$ROOT_DIR/.env" -f docker/app/prod/compose.yml run --rm backend npm run db:migrate:latest
