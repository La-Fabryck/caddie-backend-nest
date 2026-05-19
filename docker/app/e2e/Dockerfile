# Stage 1: All deps (incl. dev — Jest, Nest CLI, Kysely migrate, etc.)
FROM node:24-alpine AS deps
WORKDIR /app

COPY package*.json .npmrc ./

RUN npm ci

# Stage 2: API + exec Jest (nest start — no dist / no start:prod)
FROM node:24-alpine AS e2e
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json .npmrc ./
COPY src ./src
COPY test ./test
COPY migrations ./migrations
COPY .config ./.config
COPY tsconfig*.json nest-cli.json .swcrc ./
COPY docker/app/e2e/.env.e2e .env

CMD ["npm", "start"]
