.PHONY: update update-doctor sync-fastify install versions start ci-e2e ci-e2e-up ci-e2e-down ncu-doctor-test sloc sloc-details reset-dev help

NEST_FASTIFY_VERSION := $(shell npm info @nestjs/platform-fastify dependencies.fastify)
E2E_ENV_FILE := $(if $(wildcard .env),--env-file .env,)
E2E_COMPOSE := docker compose -p caddie-e2e $(E2E_ENV_FILE) -f docker/app/e2e/compose.yml

# Update all dependencies and sync fastify, with grouped formatting
update:
	@echo "Updating dependencies (except Fastify)..."
	npx --yes npm-check-updates --upgrade --interactive --reject fastify --format group
	@$(MAKE) sync-fastify

# Doctor: build once, stack up; each upgrade = lint + npm ci + exec test:e2e (lockfiles mounted)
update-doctor:
	@echo "Doctor upgrade (lint + e2e gate, Fastify excluded)..."
	$(E2E_COMPOSE) build test
	@$(MAKE) e2e-up
	@(npx --yes npm-check-updates --upgrade --interactive --reject fastify --doctor --doctorTest "make ncu-doctor-test" --format group; \
		r=$$?; $(E2E_COMPOSE) down; exit $$r)
	@$(MAKE) sync-fastify

ncu-doctor-test:
	npm run lint
	$(E2E_COMPOSE) exec test sh -c "npm ci && npm run test:e2e"

# Postgres → migrate → API up (CMD npm start)
e2e-up:
	$(E2E_COMPOSE) up -d postgres --wait
	$(E2E_COMPOSE) run --rm --no-deps test npm run db:migrate:latest
	$(E2E_COMPOSE) up -d test --wait

# Pin Fastify to @nestjs/platform-fastify, then lint (no auto-format)
sync-fastify:
	@echo "Syncing Fastify to: $(NEST_FASTIFY_VERSION)"
	npm install fastify@$(NEST_FASTIFY_VERSION)
	npm run lint
	@echo "Fastify synced to: $(NEST_FASTIFY_VERSION)"

# Install dependencies
install:
	@echo "Pull Docker images"
	docker compose pull
	$(E2E_COMPOSE) pull
	@echo "Install Node dependencies on host"
	npm ci
	@echo "Build e2e test image"
	$(E2E_COMPOSE) build test

# Check current versions
versions:
	@echo "NestJS requires Fastify: $(NEST_FASTIFY_VERSION)"
	npm list fastify @nestjs/platform-fastify fastify-plugin

# Postgres (Docker) + Nest on host
start:
	docker compose start --wait
	npm run start:dev

# E2E in Docker: stack up, exec Jest on the running API container
ci-e2e:
	$(E2E_COMPOSE) build test
	@$(MAKE) e2e-up
	$(E2E_COMPOSE) exec test npm run test:e2e

ci-e2e-down:
	$(E2E_COMPOSE) down -v --remove-orphans

# Reset to clean dev: remove project resources for prod+dev, ensure network, remove root .dockerignore
reset-dev:
	@echo "Stopping and removing prod stack resources (containers, images, volumes)..."
	docker compose --env-file .env -f docker/app/prod/compose.yml down -v --rmi all --remove-orphans
	@echo "Stopping and removing dev stack resources (containers, images, volumes)..."
	docker compose down -v --rmi all --remove-orphans
	@echo "Stopping and removing e2e stack resources..."
	$(E2E_COMPOSE) down -v --rmi local --remove-orphans
	@echo "Removing root .dockerignore (copied by prod build)..."
	rm -f .dockerignore
	@echo "Dev environment reset complete. Run: make start"

sloc:
	npx --yes sloc --format cli-table --format-option head --exclude "node_modules|dist|coverage" ./

sloc-details:
	npx --yes sloc . --exclude node_modules --exclude "node_modules|dist|coverage" --details

# Help target
help:
	@echo "Available targets:"
	@echo "  install         - npm ci on host, pull images, build e2e test image"
	@echo "  update          - Update all dependencies and sync fastify"
	@echo "  update-doctor   - Doctor upgrade with lint + e2e gate; revert breaking bumps"
	@echo "  sync-fastify    - Just sync Fastify version without other updates"
	@echo "  versions        - Show current Fastify package versions"
	@echo "  start           - Postgres (Docker), then npm run start:dev on host"
	@echo "  ci-e2e          - Build e2e image and run tests in Docker (one-shot)"
	@echo "  ci-e2e-down     - Stop e2e stack"
	@echo "  reset-dev       - Remove dev+prod+e2e Docker resources"
	@echo "  sloc            - Count lines of code"
	@echo "  sloc-details    - Count lines of code with details"
