.PHONY: update sync-fastify install versions dedupe lint help

NEST_FASTIFY_VERSION := $(shell npm info @nestjs/platform-fastify dependencies.fastify)

# Update all dependencies and sync fastify, with grouped formatting
update:
	@echo "Updating dependencies (except Fastify)..."
	docker compose run --rm backend npx npm-check-updates -u -i -x fastify --format group
	@echo "Syncing Fastify version to match @nestjs/platform-fastify..."
	docker compose run --rm backend npm install fastify@$(NEST_FASTIFY_VERSION)
	@echo "Update complete! Fastify synced to: $(NEST_FASTIFY_VERSION)"

# Just sync Fastify version without other updates
sync-fastify:
	@echo "Syncing Fastify to: $(NEST_FASTIFY_VERSION)"
	docker compose run --rm backend npm install fastify@$(NEST_FASTIFY_VERSION)

# Install dependencies
install:
	@echo: "npm ci..."
	docker compose run --rm backend npm ci
	@echo: "generating prisma schema"
	docker compose run --rm backend npx prisma generate

# Check current versions
versions:
	@echo "NestJS requires Fastify: $(NEST_FASTIFY_VERSION)"
	@echo ""
	npm list fastify @nestjs/platform-fastify fastify-plugin

dedupe:
	docker compose run --rm backend npm dedupe

lint:
	docker compose run --rm backend npm run lint-fix

# Help target
help:
	@echo "Available targets:"
	@echo "  update        - Update all dependencies and sync fastify"
	@echo "  versions      - Show current Fastify package versions"
	@echo "  install       - Install dependencies"
	@echo "  sync-fastify  - Just sync Fastify version without other updates"
	@echo "  dedupe        - Reduce duplication in the package tree"
	@echo "  lint          - Invoke lint-fix command"
