.PHONY: update sync-fastify install versions dedupe format lint e2e sloc sloc-details reset-dev help 

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
	
	@echo "Install the dependencies"
	docker compose run --no-deps --rm backend npm ci

# Check current versions
versions:
	@echo "NestJS requires Fastify: $(NEST_FASTIFY_VERSION)"
	npm list fastify @nestjs/platform-fastify fastify-plugin

dedupe:
	docker compose run --no-deps --rm backend npm dedupe

format:
	docker compose run --no-deps --rm backend npm run format

lint:
	docker compose run --no-deps --rm backend npm run lint

# e2e with optional pattern
e2e:
ifdef p
	docker compose run --rm backend npm run test:e2e -- --testNamePattern="$(p)"
else
	docker compose run --rm backend npm run test:e2e
endif

e2e-watch:
	docker compose run --rm backend npm run test:watch

# Reset to clean dev: tear down prod and dev stacks, ensure network, remove root .dockerignore
reset-dev:
	@echo "Stopping and removing prod stack..."
	docker compose --env-file .env -f docker/app/prod/compose.yml down -vZ
	@echo "Stopping and removing dev stack..."
	docker compose down -v
	@echo "Ensuring dev network exists..."
	docker network create caddie_network || true
	@echo "Removing root .dockerignore (copied by prod build)..."
	rm -f .dockerignore
	@echo "Dev environment reset complete. Start dev with: docker compose -f compose.yml up"

sloc:
	docker compose run --no-deps --rm backend npx --yes sloc --format cli-table --format-option head --exclude "node_modules|dist|coverage" ./

sloc-details:
	docker compose run --no-deps --rm backend npx --yes sloc . --exclude node_modules --exclude "node_modules|dist|coverage" --details

# Help target
help:
	@echo "Available targets:"
	@echo "  install         - Install dependencies"
	@echo "  update          - Update all dependencies and sync fastify"
	@echo "  sync-fastify    - Just sync Fastify version without other updates"
	@echo "  versions        - Show current Fastify package versions"
	@echo "  lint            - Invoke lint:show command"
	@echo "  format          - Invoke format command"
	@echo "  dedupe          - Reduce duplication in the package tree"
	@echo "  e2e             - Run all e2e tests"
	@echo "  e2e p=<pattern> - Run e2e tests matching pattern (e.g.: make e2e p=user)"
	@echo "  reset-dev       - Tear down prod and dev stacks, ensure network, remove root .dockerignore"
	@echo "  sloc            - Count lines of code"
	@echo "  sloc-details    - Count lines of code with details"
	
