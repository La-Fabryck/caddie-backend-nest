# Stage 1: All deps (incl. dev — Vitest, Nest CLI, Kysely migrate, etc.)
FROM node:26-alpine AS deps
WORKDIR /app

COPY package*.json .npmrc ./

# npm ci alone can skip the host platform's optional native binding (npm/cli#4828).
# Host lockfile is glibc; Alpine needs @rolldown/binding-linux-*-musl for Vitest.
RUN npm ci --prefer-offline \
	&& npm install --include=optional --no-save

# Stage 2: API + exec Vitest (nest start — no dist / no start:prod)
FROM node:26-alpine AS e2e
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json .npmrc ./
COPY src ./src
COPY test ./test
COPY migrations ./migrations
COPY .config ./.config
COPY tsconfig*.json nest-cli.json .swcrc vitest.config*.ts ./
COPY docker/app/e2e/.env.e2e .env

CMD ["npm", "start"]
