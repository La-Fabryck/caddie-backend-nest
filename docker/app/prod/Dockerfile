# Stage 1: Production deps
FROM node:24-alpine AS deps
WORKDIR /app

COPY package*.json ./

RUN npm ci

# Stage 2: Build
FROM node:24-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package*.json tsconfig*.json nest-cli.json .swcrc ./

# TODO: consider --omit=peer when ready
ENV NODE_ENV=production
RUN npm run build \
    && npm ci --omit=dev --omit=optional \
    && npm cache clean --force

# Stage 3: Runtime
FROM node:24-alpine AS runner
WORKDIR /app

# Copy built files and production node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

# Copy Kysely config and migrations so migrations can be run separately (e.g. docker compose run --rm backend npm run db:migrate:latest)
COPY --chown=node:node .config ./.config
COPY --chown=node:node migrations ./migrations

# Copy package.json for commands
COPY --chown=node:node package.json ./

# Use the node user from the image
USER node

CMD ["npm", "run", "start:prod"]
