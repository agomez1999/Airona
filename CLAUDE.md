# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Airona Globus is a multilingual e-commerce platform for booking hot air balloon experiences (vuelos en globo) over the Empordà region. It handles ticket sales, gift vouchers, Stripe payments, and an admin panel.

---

## Development Commands

### Starting the environment

```bash
# First-time setup (builds Docker, runs migrations, installs deps)
make setup

# Start backend (7 Docker containers: PHP-FPM, Nginx, PostgreSQL, Redis, Mailpit, queue worker, scheduler)
make up           # or: docker compose up -d

# Stop backend
make down
```

Frontend dev server runs separately (not in Docker):
```bash
cd frontend && npm run dev   # http://localhost:5173
```

### Backend (Laravel — all via Docker)

```bash
# Shell into PHP container
docker compose exec app sh

# Artisan commands
docker compose exec app php artisan <cmd>
docker compose exec app php artisan migrate
docker compose exec app php artisan migrate:fresh --seed
docker compose exec app php artisan route:list

# Run all backend tests
docker compose exec app php artisan test --parallel

# Run a single test or filter by name
docker compose exec app php artisan test --filter=OrderServiceTest

# PHP code formatting (Laravel Pint)
docker compose exec app ./vendor/bin/pint
```

### Frontend (React / Vite)

```bash
cd frontend

npm run dev          # Dev server at :5173 (proxies /api and /sanctum → localhost:80)
npm run build        # Production build → dist/client/
npm run build:ssr    # SSR build → dist/server/
npm run type-check   # tsc --noEmit
npm run lint         # ESLint
npm run test         # Vitest (watch mode)
npm run test:run     # Vitest (single run, CI)
npm run test:e2e     # Playwright end-to-end
```

### Local services

| Service | URL |
|---------|-----|
| Frontend (dev) | http://localhost:5173 |
| Backend API | http://localhost:80/api/v1 |
| Mailpit (email UI) | http://localhost:8025 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

---

## Architecture

### Frontend

**Stack:** React 19 · Vite 8 · TypeScript · Tailwind CSS 4 (CSS-first `@theme` in `index.css`) · React Router 7 · Zustand · TanStack Query · Framer Motion 12 · i18next 26

**Entry:** `frontend/src/main.tsx` → `AppRoutes.tsx` → `LocaleLayout.tsx` → feature pages

#### Routing & locale system

All public routes are locale-prefixed: `/:lang/{slug}/` where `lang` is `es | ca | fr | en`.

Pages do **not** use `useParams()` for the locale — they receive it via:
```ts
const { locale } = useOutletContext<LocaleContext>()
```

URL slugs are translated (e.g. `/es/vuelo-compartido/`, `/fr/vol-partage/`). The mapping lives in `frontend/src/config/routes.ts` (`slugs` object). `SlugRouter.tsx` resolves the incoming slug to a page component via `resolveSlug()`. When adding a new page, register its slug in `routes.ts` and add a case to `SlugRouter`.

#### State management

Two Zustand stores persisted to `localStorage`:
- `cartStore` (`airona_cart_v1`) — cart items, promo code, drawer open/close
- `authStore` (`airona_auth`) — authenticated admin user

The third store `uiStore` is in-memory only.

#### API client

`frontend/src/services/api/client.ts` — Axios instance at `/api` with `withCredentials: true`. Automatically attaches `Accept-Language` from `localStorage.airona_lang`. A 401 response redirects to `/admin/login`; a 429 enriches the error with `retryAfterSeconds`.

In development, Vite proxies `/api` and `/sanctum` to `http://localhost:80`.

#### i18n

9 namespaces: `common`, `home`, `seo`, `admin`, `checkout`, `experiences`, `faq`, `contact`, `confirmation`. Translation files live at `frontend/src/i18n/locales/{es|ca|fr|en}/{namespace}.json`. All are eagerly imported in `i18n/config.ts` (required for SSG). To add a new namespace: create the 4 JSON files and register them in `config.ts`.

#### Animations

All Framer Motion presets and timing constants are centralised in `frontend/src/lib/motion.ts`. Use the exports from there (`fadeUpVariants`, `staggerContainerVariants`, `accordionVariants`, `drawerVariants`, etc.) rather than defining inline variants. `viewport={{ once: true }}` is the standard for scroll-triggered animations.

#### Typography

Font: **Montserrat** loaded via Google Fonts. Three Tailwind CSS token aliases: `font-display` (headings), `font-body` (body), `font-admin` (admin UI) — all resolve to Montserrat. Defined in `index.css` `@theme` block.

---

### Backend

**Stack:** Laravel 12 · PHP 8.3 · PostgreSQL 16 · Redis · Laravel Sanctum · Stripe SDK · dompdf · simple-qrcode

#### Domain structure

Business logic is organised under `backend/app/Domains/`:

```
Domains/
  Products/    Models (Product, ProductTranslation, ProductImage), ProductService
  Orders/      Models (Order, OrderItem), DTOs (CartItemDTO, CreateOrderDTO), OrderService, CreateCheckoutSessionAction
  Payments/    Models (Payment), PaymentService
  Vouchers/    Models (Voucher, VoucherAuditLog), VoucherStateMachine, PdfVoucherService, VoucherCodeGenerator
  Promotions/  Models (Promotion), PromotionValidationService
  Blog/        Models (BlogPost, BlogPostTranslation)
```

HTTP layer (`app/Http/Controllers/Api/V1/`) is thin — it validates input, calls domain services/actions, and returns responses. Controllers are split into `Public/`, `Admin/`, `Auth/`, and `Webhooks/`.

#### Key backend patterns

**Monetary values are always in cents** (integer). Never store or pass floats for prices.

**Products are translatable.** `Product` has a `HasMany` to `ProductTranslation` (one row per locale). Queries use `->scopeForLocale()` and `->scopeBySlug()`. The same pattern applies to `BlogPost` → `BlogPostTranslation`.

**Voucher lifecycle** is enforced by `VoucherStateMachine`. Valid transitions:
```
pending_payment → active | cancelled
active → redeemed | expired | refunded | cancelled
```
Every transition appends an immutable row to `voucher_audit_logs`. Never bypass the state machine to update `vouchers.status` directly.

**Authentication** uses Sanctum cookie-based SPA auth. The `admin` middleware (`EnsureUserIsAdmin`) checks `$user->isAdmin()`; superadmin-only actions are guarded inside the controller. CSRF is handled via `/sanctum/csrf-cookie` → Axios `withXSRFToken: true`.

**Stripe** uses redirect-based Checkout. Flow: `POST /api/v1/checkout/sessions` → Stripe session created → frontend redirects user → Stripe calls `POST /api/v1/webhooks/stripe` → order/voucher activated. The webhook route bypasses Sanctum stateful middleware.

#### Email templates

Blade templates in `backend/resources/views/emails/`. All templates accept a `$locale` variable and contain `@if($locale === 'ca') ... @elseif($locale === 'fr') ... @elseif($locale === 'en') ... @else (Spanish) @endif` blocks for multilingual content. Always pass `locale` when dispatching mail.

---

## Environment

Copy `.env.example` → `.env` and `backend/.env.example` → `backend/.env` before first run. Key variables: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `FRONTEND_URL`. File storage defaults to `local`; set `FILESYSTEM_DISK=s3` + S3/R2 credentials for production.

---

## Agent System

The `agents/` directory contains specialised agent definitions for this project. When tackling a complex task, load the relevant agent's file as context — it carries domain knowledge, constraints, and output expectations that would otherwise need to be re-derived.

### Available agents

| File | Agent | Use for |
|------|-------|---------|
| `agents/orchestrator.md` | Orchestrator | Coordinating multi-agent tasks, breaking down large features, enforcing architectural consistency across domains |
| `agents/solution-architect.md` | Solution Architect | High-level decisions: folder structure, API contracts, database modelling, domain boundaries, scalability strategy |
| `agents/frontend-react-lead.md` | Frontend Lead | React architecture, component design, routing, state management, API integration, performance |
| `agents/backend-laravel-lead.md` | Backend Lead | Laravel API design, service layer, DTOs, queue jobs, domain logic, authentication flows |
| `agents/ecommerce-voucher-specialist.md` | Voucher Specialist | Voucher lifecycle, redemption flows, expiration logic, PDF delivery, fraud prevention |
| `agents/stripe-payments-agent.md` | Stripe Agent | Stripe Checkout integration, webhook validation, refunds, idempotency, payment reconciliation |
| `agents/ui-ux-designer.md` | UI/UX Designer | Landing pages, checkout UX, conversion optimisation, visual hierarchy, mobile experience |
| `agents/devops-infrastructure-agent.md` | DevOps Agent | Docker, CI/CD, deployments, Nginx config, SSL, backups, environment isolation |
| `agents/qa-testing-agent.md` | QA Agent | Test strategy, E2E flows (Playwright), backend tests (Pest), critical paths: voucher expiry, payment confirmation, duplicate redemption |
| `agents/security-compliance-agent.md` | Security Agent | OWASP review, rate limiting, GDPR compliance, webhook signature verification, voucher abuse prevention |
| `agents/product-owner.md` | Product Owner | Feature prioritisation, user stories, acceptance criteria, business rules, MVP scope |

### How to use them

When starting a task that falls within a specialist's domain, begin your prompt with the contents of that agent's file (or reference it explicitly). For large cross-cutting tasks, start with the **Orchestrator** — it will decompose the work and coordinate the appropriate specialists.

**Single-domain task** — load one agent:
```
[contents of agents/backend-laravel-lead.md]

Add a booking system to the Orders domain...
```

**Multi-domain task** — load the Orchestrator first:
```
[contents of agents/orchestrator.md]

Design and implement a booking calendar feature (frontend + backend + payments)...
```

### Key constraints from agents

These rules are defined in the agent files and must always be respected regardless of which agent is active:

- **No business logic in controllers** — use Services, Actions, or DTOs (backend-laravel-lead, orchestrator)
- **Vouchers activate only after verified webhook** — never on frontend signal alone (stripe-payments-agent, ecommerce-voucher-specialist)
- **Never bypass `VoucherStateMachine`** — all status transitions go through it (ecommerce-voucher-specialist)
- **Stripe webhook signatures must always be verified** — (stripe-payments-agent)
- **All new UI should match the brand** — premium, emotional, adventure-focused (ui-ux-designer, frontend-react-lead)
