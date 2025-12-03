.PHONY: help setup start stop restart logs clean rebuild seed-db dump-db

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

setup: ## Initial setup (fresh start with DB seed)
	./scripts/setup-local.sh --fresh --seed-db

setup-quick: ## Quick setup (no DB seed)
	./scripts/setup-local.sh --fresh

start: ## Start all services
	docker-compose up -d

stop: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

restart-core: ## Restart just the core service
	docker-compose restart core

rebuild-core: ## Rebuild and restart core service
	docker-compose up --build -d core

logs: ## Show logs for all services (Ctrl+C to exit)
	docker-compose logs -f

logs-core: ## Show logs for core service
	docker-compose logs -f core

logs-db: ## Show postgres logs
	docker-compose logs -f postgres

clean: ## Remove all containers and volumes
	docker-compose down -v

rebuild: ## Rebuild all images and start fresh
	docker-compose down -v
	docker-compose build --no-cache
	docker-compose up -d

seed-db: ## Seed database from latest dump
	docker-compose down -v
	docker-compose up -d

dump-db: ## Dump production database
	./scripts/dump-prod-db.sh

shell-core: ## Open shell in core container
	docker-compose exec core sh

shell-db: ## Open psql in postgres container
	docker-compose exec postgres psql -U sprocketbot

migrations: ## Run database migrations
	docker-compose exec core npm run migration:run

test-graphql: ## Test GraphQL endpoint
	@curl -s http://localhost:3001/graphql \
		-H 'Content-Type: application/json' \
		-d '{"query": "{ __typename }"}' \
		| jq . || echo "Install jq for pretty output: brew install jq"

status: ## Show status of all services
	docker-compose ps

# Quick development shortcuts
dev-start: start logs-core ## Start services and tail core logs

dev-rebuild: rebuild-core logs-core ## Rebuild core and tail logs

# For rapid iteration on a specific service
watch-core: ## Rebuild core whenever you run this (run after making changes)
	@echo "Rebuilding core..."
	@docker-compose up --build -d core
	@echo "✓ Core rebuilt. Tailing logs (Ctrl+C to exit)..."
	@docker-compose logs -f --tail=50 core
