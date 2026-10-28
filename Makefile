.PHONY: update update-dependencies update-lockfile sync-cookie install start ci-e2e e2e-up ci-e2e-down doctor-test sloc sloc-details reset-dev help

MAKEFLAGS += --no-print-directory

E2E_ENV_FILE := $(if $(wildcard .env),--env-file .env,)
E2E_COMPOSE := docker compose -p caddie-e2e $(E2E_ENV_FILE) -f docker/app/e2e/compose.yml

# ponytail: oxfmt/nest/vitest lack --quiet; one status line, dump log only on failure
STEP := sh -c 'label=$$1; shift; out=$$("$$@" 2>&1); r=$$?; if [ $$r -eq 0 ]; then echo "$$label ok"; else printf "%s\n" "$$out"; echo "$$label failed"; exit $$r; fi' --

# Doctor upgrade then lockfile refresh
update:
	@$(MAKE) update-dependencies
	@$(MAKE) update-lockfile

# Doctor: build once, stack up; each upgrade = lint + typecheck + build (host) + npm ci + exec test:e2e
update-dependencies:
	@echo "Doctor upgrade (lint + e2e gate, cookie synced from platform-node)..."
	@echo "Building e2e image and starting Docker stack..."
	@$(E2E_COMPOSE) --progress quiet build test
	@$(MAKE) e2e-up
	@(npx --yes npm-check-updates --upgrade --interactive --reject '/^(cookie|@types\/cookie)$$/' --doctor --doctorTest "make doctor-test" --format group; \
		r=$$?; $(E2E_COMPOSE) --progress quiet down; exit $$r)
	@$(MAKE) sync-cookie

# Refresh lockfile only (package.json ranges), doctor gate, restore lock on failure
update-lockfile:
	@echo "Refreshing package-lock.json (lock-only + doctor gate)..."
	@cp package-lock.json package-lock.json.bak
	@cp package.json package.json.bak
	@$(E2E_COMPOSE) --progress quiet build test
	@$(MAKE) e2e-up
	@( \
		npm install --package-lock-only --no-fund --no-audit && \
		$(MAKE) sync-cookie && \
		npm ci --prefer-offline --no-fund --no-audit && \
		$(MAKE) doctor-test; \
		r=$$?; \
		if [ $$r -eq 0 ]; then \
			rm -f package-lock.json.bak package.json.bak; \
			echo "update-lockfile ok"; \
		else \
			echo "update-lockfile failed, restoring package.json and package-lock.json"; \
			mv package-lock.json.bak package-lock.json; \
			mv package.json.bak package.json; \
			npm ci --prefer-offline --no-fund --no-audit; \
		fi; \
		$(E2E_COMPOSE) --progress quiet down; \
		exit $$r \
	)

doctor-test:
	@$(STEP) typecheck npm run typecheck
	@$(STEP) lint npm run lint
	@$(STEP) build npm run build
	@$(STEP) e2e $(E2E_COMPOSE) --progress quiet exec -T test \
		sh -c 'npm ci --prefer-offline --silent && npm install --include=optional --no-save --silent && NODE_NO_WARNINGS=1 npm run test:e2e'

# Postgres → migrate → API up (CMD npm start)
e2e-up:
	@$(E2E_COMPOSE) --progress quiet up -d postgres --wait
	@$(STEP) migrate $(E2E_COMPOSE) --progress quiet run --rm --no-deps -T test npm run db:migrate:latest
	@$(E2E_COMPOSE) --progress quiet up -d test --wait

# Pin cookie to the version required by the platform-node range in package.json.
# ncu ignores cookie; this follows Nest. cookie 2.x drops parse, so typecheck fails until readRequestCookie changes.
sync-cookie:
	@spec=$$(node -p "JSON.parse(require('node:fs').readFileSync('package.json','utf8')).dependencies['@nestjs/platform-node']"); \
	version=$$(npm view "@nestjs/platform-node@$$spec" dependencies.cookie); \
	test -n "$$version" && \
	echo "Syncing cookie to: $$version" && \
	npm install --save-exact --no-fund --no-audit --silent "cookie@$$version" && \
	$(STEP) typecheck npm run typecheck && \
	echo "cookie synced to: $$version"

# Install dependencies
install:
	@echo "Pull Docker images"
	docker compose pull
	$(E2E_COMPOSE) pull
	@echo "Install Node dependencies on host"
	npm ci --prefer-offline
	@echo "Build e2e test image"
	$(E2E_COMPOSE) build test

# Postgres (Docker) + Nest on host
start:
	docker compose up -d --wait
	npm run start:dev

# E2E in Docker: stack up, exec Jest on the running API container
ci-e2e:
	$(E2E_COMPOSE) build test
	@$(MAKE) e2e-up
	$(E2E_COMPOSE) exec test npm run test:e2e

ci-e2e-down:
	$(E2E_COMPOSE) down -v --remove-orphans

# Reset to clean dev: remove project resources for prod+dev
reset-dev:
	@echo "Stopping and removing prod stack resources (containers, images, volumes)..."
	docker compose --env-file .env -f docker/app/prod/compose.yml down -v --rmi all --remove-orphans
	@echo "Stopping and removing dev stack resources (containers, images, volumes)..."
	docker compose down -v --rmi all --remove-orphans
	@echo "Stopping and removing e2e stack resources..."
	$(E2E_COMPOSE) down -v --rmi local --remove-orphans
	@echo "Dev environment reset complete. Run: make start"

sloc:
	npx --yes sloc --format cli-table --format-option head --exclude "node_modules|dist|coverage" ./

sloc-details:
	npx --yes sloc . --exclude node_modules --exclude "node_modules|dist|coverage" --details

# Help target
help:
	@echo "Available targets:"
	@echo "  install              - npm ci on host, pull images, build e2e test image"
	@echo "  update               - update-dependencies then update-lockfile"
	@echo "  update-dependencies  - Doctor upgrade with lint + e2e gate; revert breaking bumps"
	@echo "  update-lockfile      - Refresh lockfile only, doctor gate, restore lock on failure"
	@echo "  doctor-test          - Single doctor gate step (typecheck/lint/build/e2e)"
	@echo "  sync-cookie          - Pin cookie to the version @nestjs/platform-node depends on"
	@echo "  start                - Postgres (Docker), then npm run start:dev on host"
	@echo "  ci-e2e               - Build e2e image and run tests in Docker (one-shot)"
	@echo "  ci-e2e-down          - Stop e2e stack"
	@echo "  reset-dev            - Remove dev+prod+e2e Docker resources"
	@echo "  sloc                 - Count lines of code"
	@echo "  sloc-details         - Count lines of code with details"
