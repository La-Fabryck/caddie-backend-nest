.PHONY: update sync-fastify install versions dedupe lint-fix lint-show e2e help 

NEST_FASTIFY_VERSION := $(shell npm info @nestjs/platform-fastify dependencies.fastify)

# Update all dependencies and sync fastify, with grouped formatting
update:
	@echo "Updating dependencies (except Fastify)..."
	docker compose run --no-deps --rm backend npx --yes npm-check-updates -u -i -x fastify --format group
	@echo "Syncing Fastify version to match @nestjs/platform-fastify..."
	docker compose run --no-deps --rm backend npm install fastify@$(NEST_FASTIFY_VERSION)
	@echo "Update complete! Fastify synced to: $(NEST_FASTIFY_VERSION)"

# Just sync Fastify version without other updates
sync-fastify:
	@echo "Syncing Fastify to: $(NEST_FASTIFY_VERSION)"
	docker compose run --no-deps --rm backend npm install fastify@$(NEST_FASTIFY_VERSION)

# Install dependencies
install:
	@echo "Create the network"
	docker network create caddie_network || true
	
	@echo "Pull docker dependencies"
	docker compose pull
	
	@echo "Build the Nest image"
	docker compose build
	
	@echo "Install the dependencies and generate the prisma schemes"
	docker compose run --no-deps --rm backend npm ci
	docker compose run --no-deps --rm backend npx prisma generate

# Check current versions
versions:
	@echo "NestJS requires Fastify: $(NEST_FASTIFY_VERSION)"
	npm list fastify @nestjs/platform-fastify fastify-plugin

dedupe:
	docker compose run --no-deps --rm backend npm dedupe

lint-fix:
	docker compose run --no-deps --rm backend npm run lint:fix

lint-show:
	docker compose run --no-deps --rm backend npm run lint:show

# e2e with optional pattern
e2e:
ifdef p
	docker compose run --rm backend npm run test:e2e -- --testNamePattern="$(p)"
else
	docker compose run --rm backend npm run test:e2e
endif

# Help target
# Help target
help:
	@echo "Available targets:"
	@echo "  install         - Install dependencies"
	@echo "  update          - Update all dependencies and sync fastify"
	@echo "  sync-fastify    - Just sync Fastify version without other updates"
	@echo "  versions        - Show current Fastify package versions"
	@echo "  lint-show       - Invoke lint:show command"
	@echo "  lint-fix        - Invoke lint:fix command"
	@echo "  dedupe          - Reduce duplication in the package tree"
	@echo "  e2e             - Run all e2e tests"
	@echo "  e2e p=<pattern> - Run e2e tests matching pattern (e.g.: make e2e p=user)"
	
