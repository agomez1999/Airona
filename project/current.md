# AIRONA — CURRENT PROJECT STATE

> Last updated: 2026-05-23
> Phase: **1 complete → Phase 2 next**

---

## STATUS OVERVIEW

| Area | Status | Notes |
|------|--------|-------|
| Docker infrastructure | ✅ Running | 7 containers healthy |
| Database schema | ✅ Migrated | 15 tables created |
| Laravel backend | ✅ Scaffolded | Domain structure, packages installed |
| React frontend | ✅ Scaffolded | All packages, Vite config, design tokens |
| GitHub Actions CI | ✅ Configured | Triggers on PR and push to main |
| Products API | ✅ Complete | Public + Admin CRUD, multilingual |
| Auth (Sanctum) | ✅ Complete | Login/logout/me, EnsureUserIsAdmin |
| Ecommerce / Stripe | ⬜ Not started | Phase 2 |
| Voucher system | ⬜ Not started | Phase 3 |
| Public pages | ⬜ Not started | Phase 4 |
| Admin panel | ⬜ Not started | Phase 5 |

---

## RUNNING SERVICES

```
docker compose up -d
```

| Container | Port | Status |
|-----------|------|--------|
| airona-nginx-1 | 80 | Up |
| airona-app-1 (PHP-FPM) | 9000 (internal) | Up |
| airona-queue-1 | — | Up |
| airona-scheduler-1 | — | Up |
| airona-postgres-1 | 5432 | Up (healthy) |
| airona-redis-1 | 6379 | Up (healthy) |
| airona-mailpit-1 | 1025 (SMTP), 8025 (UI) | Up (healthy) |

### Access points
- **Laravel health check:** `http://localhost/up` → "Application up"
- **API base:** `http://localhost/api/v1/`
- **Mailpit UI:** `http://localhost:8025`
- **Frontend dev server:** `cd frontend && npm run dev` → `http://localhost:5173`

---

## PROJECT STRUCTURE

```
Airona/
├── project/
│   ├── project.md          ← Business requirements
│   ├── roadmap.md          ← Full phase roadmap
│   └── current.md          ← This file
├── agents/                 ← Specialized agent definitions (10 agents)
├── backend/                ← Laravel 12 API
│   ├── app/
│   │   ├── Domains/        ← Domain-separated business logic
│   │   │   ├── Auth/
│   │   │   ├── Blog/
│   │   │   ├── CMS/
│   │   │   ├── Notifications/
│   │   │   ├── Orders/
│   │   │   ├── Payments/
│   │   │   ├── Products/
│   │   │   ├── Promotions/
│   │   │   └── Vouchers/
│   │   ├── Events/
│   │   ├── Listeners/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/{Public,Admin,Webhooks}/
│   │   │   ├── Requests/
│   │   │   ├── Resources/
│   │   │   └── Middleware/
│   │   ├── Exceptions/
│   │   └── Policies/
│   ├── config/
│   │   ├── stripe.php      ← Stripe config (keys, currency)
│   │   └── voucher.php     ← Voucher config (validity, code format)
│   └── database/
│       └── migrations/     ← 15 migrations (12 custom)
├── frontend/               ← React 19 + Vite + TypeScript
│   ├── src/
│   │   ├── index.css       ← Brand design tokens + TailwindCSS
│   │   └── ...
│   ├── vite.config.ts      ← API proxy, code splitting, path alias
│   └── package.json
├── docker/
│   ├── php/
│   │   ├── Dockerfile      ← PHP 8.4 FPM, multi-stage
│   │   └── php.ini
│   ├── nginx/
│   │   ├── nginx.conf      ← Rate limiting zones
│   │   └── conf.d/default.conf
│   └── postgres/
│       └── init.sql        ← Creates airona_test DB for CI
├── .github/
│   └── workflows/ci.yml    ← Full CI pipeline
├── docker-compose.yml
├── .env.example            ← All variables documented
├── .gitignore
└── Makefile                ← Developer shortcuts
```

---

## DATABASE SCHEMA

All tables migrated and verified in PostgreSQL 16.

### Tables

| Table | Purpose | Key columns |
|-------|---------|-------------|
| `users` | Admin users only | email, role (admin\|superadmin) |
| `products` | Flight experience catalogue | sku, type, price_cents, is_visible |
| `product_translations` | Multilingual content | product_id, locale, name, slug, meta_* |
| `product_images` | Gallery images | product_id, path, sort_order |
| `promotions` | Discount codes | code, discount_type, discount_value, used_count, max_uses |
| `orders` | Purchase records | id (UUID), stripe_checkout_session_id, idempotency_key, status |
| `order_items` | Line items with price snapshot | order_id, product_name (snapshot), unit_price_cents (snapshot) |
| `vouchers` | Gift vouchers | id (UUID), code (AIRONA-XXXX-XXXX-XXXX), status, expires_at |
| `voucher_audit_log` | Immutable event log | voucher_id, action, actor_type, actor_id, created_at only |
| `payments` | Stripe payment records | id (UUID), stripe_payment_intent_id, stripe_checkout_session_id |
| `blog_posts` | Blog articles | status (draft\|published\|archived) |
| `blog_post_translations` | Multilingual blog content | locale, slug (unique per locale), body |
| `cms_pages` | Static pages | identifier (about-us, faq, etc.) |
| `cms_page_translations` | Multilingual static content | locale, slug, body |
| `personal_access_tokens` | Sanctum tokens | tokenable_type, tokenable_id |

### Design rules applied
- **UUIDs on:** orders, vouchers, payments (public-facing, prevents enumeration)
- **Integer cents** for all monetary values (no floats)
- **Price snapshot** in order_items (financial integrity across product changes)
- **Soft deletes** on products, blog_posts, cms_pages, promotions
- **No soft deletes** on orders, vouchers, payments (financial records)
- **Audit log** is append-only (`created_at` only, no `updated_at`)

---

## BACKEND (Laravel 12)

### Installed packages

| Package | Version | Purpose |
|---------|---------|---------|
| laravel/sanctum | ^4.3 | Admin SPA authentication |
| stripe/stripe-php | ^20.1 | Stripe Checkout Sessions + webhooks |
| barryvdh/laravel-dompdf | ^3.1 | PDF voucher generation |
| simplesoftwareio/simple-qrcode | ^4.2 | QR code generation for vouchers |
| pestphp/pest | ^3.0 | Backend testing framework |
| pestphp/pest-plugin-laravel | ^3.0 | Laravel test helpers |

### Custom config files
- `config/stripe.php` — reads `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CURRENCY`
- `config/voucher.php` — reads `VOUCHER_VALIDITY_DAYS` (365), `VOUCHER_DOWNLOAD_URL_TTL_HOURS` (72), code format config

### Domain structure
Each domain owns: `Models/`, `Services/`, `Actions/`, `DTOs/`
Controllers are thin — all logic lives in Services and Actions.

### Queue channels (configured, no jobs yet)
```
webhooks  → Stripe webhook handlers (dedicated, never backlogged)
high      → Voucher creation, PDF generation
default   → Email sending
low       → Expiry reminders, non-critical
```

---

## FRONTEND (React 19 + Vite)

### Installed packages

| Package | Purpose |
|---------|---------|
| react-router-dom v7 | Routing with `/:lang/` locale prefix |
| @tanstack/react-query v5 | Server state management |
| zustand v5 | Client state (cart, auth, ui) |
| react-hook-form + @hookform/resolvers | Form handling |
| zod v4 | Schema validation |
| i18next + react-i18next | Internationalisation (es, ca, fr, en) |
| i18next-http-backend | Lazy-load locale files |
| i18next-browser-languagedetector | Auto-detect user language |
| react-helmet-async | Meta tags / SEO (SSG-compatible) |
| axios | HTTP client with interceptors |
| tailwindcss v4 + @tailwindcss/vite | Styling |

### Design tokens (in `src/index.css`)
```
--color-brand-sky:     #87CEEB  (balloon sky blue)
--color-brand-gold:    #C9A84C  (premium gold accent)
--color-brand-dusk:    #1C1C2E  (deep night — header/footer)
--color-brand-cream:   #FAF7F2  (warm off-white — background)
--color-brand-sunrise: #FF7043  (sunrise orange — CTAs)
--color-brand-mist:    #F0EDE8  (subtle sections)

--font-display: "Playfair Display", Georgia, serif  (headings)
--font-body:    "Inter", system-ui, sans-serif       (body)
```

### Vite configuration
- API proxy: `/api/*` and `/sanctum/*` → `http://localhost:80`
- Path alias: `@/` → `src/`
- Production code splitting: vendor-react, vendor-query, vendor-i18n, vendor-forms

---

## ENVIRONMENT VARIABLES

Copy `backend/.env.example` → `backend/.env` and fill in:

```bash
# Required immediately
APP_KEY=<generated>           # ✅ Already set
DB_HOST=postgres              # ✅ Set for Docker
REDIS_HOST=redis              # ✅ Set for Docker

# Required for Phase 2
STRIPE_SECRET_KEY=sk_test_    # Get from Stripe Dashboard
STRIPE_PUBLISHABLE_KEY=pk_test_
STRIPE_WEBHOOK_SECRET=whsec_  # Get after registering webhook URL

# Required for email (Phase 3)
# Mailpit works locally — change for staging/production:
# MAIL_MAILER=mailgun
# MAIL_HOST=smtp.mailgun.org
```

---

## DEVELOPER WORKFLOW

```bash
# Start everything
make up                      # or: docker compose up -d

# First-time setup
make setup

# Run backend tests
make test-backend            # or: docker compose exec app php artisan test

# Run a migration
make migrate                 # or: docker compose exec app php artisan migrate

# Shell into the app container
make bash                    # or: docker compose exec app sh

# Run any artisan command
make artisan CMD=route:list

# Frontend dev server (runs on host, not in Docker)
cd frontend && npm run dev   # → http://localhost:5173

# Frontend type check
cd frontend && npm run type-check

# Email testing
# Send any email → it appears at http://localhost:8025
```

---

## WHAT'S NEXT — PHASE 1

The immediate next step is **Phase 1: Core Backend**.

### Priority order for Phase 1

1. **Sanctum admin auth** — login/logout/me + CSRF cookie + rate limiting
2. **Product model + ProductTranslation model** — relationships, scopes (`visible()`, `forLocale()`)
3. **Admin ProductController** — CRUD with multilingual content
4. **Public ProductController** — list active products, get by slug (locale-aware)
5. **API Resource classes** — standardised `{ data, meta }` response format
6. **CORS config** — allow `http://localhost:5173` in development
7. **Admin login page** (frontend) — connects to Sanctum endpoints
8. **Feature tests** — Auth + Products

### Files to create in Phase 1

**Backend:**
```
app/Domains/Auth/Services/AuthService.php
app/Domains/Products/Models/Product.php
app/Domains/Products/Models/ProductTranslation.php
app/Domains/Products/Services/ProductService.php
app/Http/Controllers/Api/V1/Public/ProductController.php
app/Http/Controllers/Api/V1/Admin/AdminProductController.php
app/Http/Resources/ProductResource.php
app/Http/Resources/ProductTranslationResource.php
app/Http/Requests/Admin/CreateProductRequest.php
app/Http/Requests/Admin/UpdateProductRequest.php
tests/Feature/Auth/AdminAuthTest.php
tests/Feature/Products/ProductApiTest.php
```

**Frontend:**
```
src/services/api/client.ts
src/services/api/endpoints.ts
src/services/api/types/experience.types.ts
src/features/admin/AdminLoginPage.tsx
src/stores/authStore.ts
```

---

## KNOWN ISSUES / NOTES

| Issue | Status | Note |
|-------|--------|------|
| PHP version in Docker | Resolved | Changed from 8.3 → 8.4 (Laravel 12 dependency chain) |
| Nginx redirect loop when `frontend/dist/` absent | Resolved | Changed fallback to `=404` in dev |
| `vendor/` installed on host before Docker | Resolved | Re-installed inside container with correct PHP version |
| Queue container restarting | Resolved | Rebuilt with PHP 8.4 image |

---

## AGENT REFERENCE

| Agent file | Role |
|-----------|------|
| `agents/orchestrator.md` | Master coordinator — architectural consistency, task delegation |
| `agents/solution-architect.md` | Backend + frontend architecture, API contracts, DB modeling |
| `agents/product-owner.md` | Business requirements, feature priorities, user stories |
| `agents/backend-laravel-lead.md` | Laravel API, services, actions, queue jobs |
| `agents/frontend-react-lead.md` | React architecture, routing, state management, SSG |
| `agents/ecommerce-voucher-specialist.md` | Voucher lifecycle, checkout flow, redemption logic |
| `agents/stripe-payments-agent.md` | Stripe integration, webhook handling, refunds |
| `agents/ui-ux-designer.md` | Page layouts, CTA strategy, premium UX |
| `agents/devops-infrastructure-agent.md` | Docker, CI/CD, deployment, backups |
| `agents/security-compliance-agent.md` | Rate limiting, GDPR, audit logging, OWASP |
| `agents/qa-testing-agent.md` | Test strategy, Pest, Playwright, Stripe CLI |
