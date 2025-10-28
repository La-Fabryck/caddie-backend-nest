# Stage 1: Production deps + Prisma
FROM node:24-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci \
    && npx prisma generate

# Stage 2: Build
FROM node:24-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package*.json tsconfig*.json nest-cli.json ./

# TODO: test prune instead of ci
# && npm prune --production \
ENV NODE_ENV=production
RUN npm run build \
    && npm ci --only=production \
    && npm cache clean --force

# Stage 3: Runtime
FROM node:24-alpine AS runner
WORKDIR /app

# Copy built files and production node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

# Copy prisma related files
COPY --from=deps --chown=node:node /app/node_modules/.prisma /app/node_modules/.prisma
COPY --chown=node:node prisma ./prisma/

# Copy package.json for commands
COPY --chown=node:node package.json ./

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Use the node user from the image
USER node

# Execute the migration & start the server
CMD ["sh", "-c", "npm run db:deploy && npm run start:prod"]
