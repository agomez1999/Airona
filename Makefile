.PHONY: help setup up down restart build logs bash artisan migrate migrate-fresh seed test test-backend test-frontend tinker queue-work redis-cli npm \
        prod-deploy prod-migrate prod-logs prod-shell prod-backup prod-artisan

# Default: show help
help:
	@echo ""
	@echo "  Airona — Developer Commands"
	@echo "  ────────────────────────────────────────────────────"
	@echo "  make setup          First-time project setup"
	@echo "  make up             Start all services"
	@echo "  make down           Stop all services"
	@echo "  make restart        Restart all services"
	@echo "  make build          Rebuild Docker images"
	@echo "  make logs           Follow all logs"
	@echo "  make bash           Shell into the app container"
	@echo "  make artisan CMD=   Run artisan command (e.g. make artisan CMD=route:list)"
	@echo "  make migrate        Run database migrations"
	@echo "  make migrate-fresh  Drop all tables and re-run migrations + seed"
	@echo "  make seed           Run database seeders"
	@echo "  make test           Run all tests"
	@echo "  make test-backend   Run Pest PHP tests"
	@echo "  make test-frontend  Run Vitest unit tests"
	@echo "  make tinker         Open Laravel Tinker"
	@echo "  make npm CMD=       Run npm command in frontend (e.g. make npm CMD='run dev')"
	@echo "  make redis-cli      Open Redis CLI"
	@echo ""
	@echo "  Production Commands"
	@echo "  ────────────────────────────────────────────────────"
	@echo "  make prod-deploy VERSION=  Deploy a release tag (e.g. VERSION=v1.2.0)"
	@echo "  make prod-migrate          Run migrations on production"
	@echo "  make prod-logs             Follow production container logs"
	@echo "  make prod-shell            Shell into the production app container"
	@echo "  make prod-backup           Dump production DB to local .sql.gz"
	@echo "  make prod-artisan CMD=     Run artisan on production"
	@echo ""

# ── Bootstrap ─────────────────────────────────────────────────────────────────

setup:
	@echo "▶ Copying .env files..."
	@test -f .env || cp .env.example .env
	@test -f backend/.env || cp backend/.env.example backend/.env
	@echo "▶ Building Docker images..."
	docker compose build
	@echo "▶ Starting services..."
	docker compose up -d
	@echo "▶ Waiting for PostgreSQL to be ready..."
	@sleep 3
	@echo "▶ Installing Composer dependencies..."
	docker compose exec app composer install
	@echo "▶ Generating application key..."
	docker compose exec app php artisan key:generate
	@echo "▶ Running migrations..."
	docker compose exec app php artisan migrate --seed
	@echo "▶ Installing npm dependencies..."
	cd frontend && npm install
	@echo ""
	@echo "✅ Setup complete!"
	@echo "   Backend API : http://localhost:80/api/v1/products"
	@echo "   Frontend    : cd frontend && npm run dev  →  http://localhost:5173"
	@echo "   Mailpit     : http://localhost:8025"
	@echo ""

# ── Docker ────────────────────────────────────────────────────────────────────

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

build:
	docker compose build --no-cache

logs:
	docker compose logs -f

# ── Application ───────────────────────────────────────────────────────────────

bash:
	docker compose exec app sh

artisan:
	docker compose exec app php artisan $(CMD)

migrate:
	docker compose exec app php artisan migrate

migrate-fresh:
	docker compose exec app php artisan migrate:fresh --seed

seed:
	docker compose exec app php artisan db:seed

tinker:
	docker compose exec app php artisan tinker

# ── Testing ───────────────────────────────────────────────────────────────────

test: test-backend test-frontend

test-backend:
	docker compose exec app php artisan test --parallel

test-frontend:
	cd frontend && npm run test

# ── Frontend ──────────────────────────────────────────────────────────────────

npm:
	cd frontend && npm $(CMD)

# ── Utilities ─────────────────────────────────────────────────────────────────

redis-cli:
	docker compose exec redis redis-cli

fresh: down
	docker compose down -v
	$(MAKE) setup

# ── Production ─────────────────────────────────────────────────────────────────

prod-deploy:
	@echo "Usage: make prod-deploy VERSION=v1.2.0"
	@test -n "$(VERSION)" || (echo "Error: VERSION is required" && exit 1)
	bash scripts/deploy.sh $(VERSION)

prod-migrate:
	docker compose -f docker-compose.prod.yml exec -T app php artisan migrate --force

prod-logs:
	docker compose -f docker-compose.prod.yml logs -f --tail=100

prod-shell:
	docker compose -f docker-compose.prod.yml exec app sh

prod-backup:
	docker compose -f docker-compose.prod.yml exec -T postgres \
	    sh -c 'PGPASSWORD=$$POSTGRES_PASSWORD pg_dump -U $$POSTGRES_USER $$POSTGRES_DB' \
	    | gzip > backup_$(shell date +%Y%m%d_%H%M%S).sql.gz
	@echo "Local backup created."

prod-artisan:
	@test -n "$(CMD)" || (echo "Usage: make prod-artisan CMD=route:list" && exit 1)
	docker compose -f docker-compose.prod.yml exec -T app php artisan $(CMD)
