# AIRONA — PROJECT ROADMAP

> Premium Hot Air Balloon Experience Platform
> Last updated: 2026-05-23

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Complete |
| 🔄 | In progress |
| ⬜ | Not started |
| 🔒 | Blocked by dependency |

---

## PHASE 0 — Infrastructure & Scaffolding ✅
> **Goal:** Working development environment, project scaffolding, CI foundation
> **Status: COMPLETE**

### Deliverables

- [x] Docker Compose stack — 7 services: nginx, app, queue, scheduler, postgres, redis, mailpit
- [x] PHP 8.4 FPM Dockerfile — multi-stage (dev / deps / prod), all extensions
- [x] Nginx configuration — rate limiting zones, PHP-FPM proxy, static file serving
- [x] PostgreSQL 16 + Redis 7 — health checks, persistent volumes
- [x] Queue worker — listening on `webhooks, high, default, low`
- [x] Scheduler — 60-second loop
- [x] Laravel 12 project scaffolded — domain folder structure (`app/Domains/`)
- [x] All 12 custom database migrations — products, orders, vouchers, payments, blog, CMS
- [x] React + Vite + TypeScript + TailwindCSS frontend scaffolded
- [x] All frontend packages installed — React Query, Zustand, React Router v7, i18next, Stripe, Zod
- [x] Vite config — API proxy, path alias `@/`, production code splitting
- [x] Brand design tokens — palette, typography in `index.css`
- [x] GitHub Actions CI pipeline — backend tests, TypeScript check, Vitest, Playwright on main
- [x] `.env.example` — all variables documented
- [x] `Makefile` — developer shortcuts

### Key technical decisions made
- PHP 8.4 (Laravel 12 dependency chain requires it)
- Dev: Vite dev server on port 5173 proxies `/api` to Nginx on port 80
- Prod: Nginx serves built `frontend/dist/` as static files

---

## PHASE 1 — Core Backend ✅
> **Goal:** Working API foundation, admin auth, multilingual product catalogue
> **Status: COMPLETE**
> **Depends on:** Phase 0 ✅

### Deliverables

- [x] **Auth domain** — Sanctum SPA cookie login/logout/me + rate limiting
- [x] **Product domain** — Product + ProductTranslation + ProductImage models
- [x] **Products API (public)** — `GET /api/v1/products`, `GET /api/v1/products/{slug}`
- [x] **Admin Products API** — full CRUD with multilingual content tabs
- [x] **API Resource classes** — standardised response envelope `{ data, meta, message }`
- [x] **Form Request validation** — per-domain request classes
- [x] **CORS configuration** — frontend origin allowlist
- [x] **Admin login page** (frontend) — Sanctum SPA auth flow
- [x] **Feature tests** — Auth (login, logout, superadmin) + Products (CRUD, multilingual, 23 tests passing)

### Responsible agents
Backend Laravel Lead · Solution Architect

---

## PHASE 2 — Ecommerce Core ⬜
> **Goal:** End-to-end purchase flow working in Stripe test mode
> **Estimated:** 2 weeks
> **Depends on:** Phase 1

### Deliverables

- [ ] **Cart store** (Zustand + localStorage) — add, remove, quantity, persistence
- [ ] **Server-side price validation** — backend rejects manipulated prices
- [ ] **Promo code validation** — `GET /api/v1/promotions/validate`
- [ ] **Checkout form** (React Hook Form + Zod) — email, billing, T&C, VoucherValidityNotice
- [ ] **`POST /api/v1/checkout/sessions`** — CreateOrderAction, Stripe Checkout Session
- [ ] **Stripe webhook endpoint** — `POST /api/v1/webhooks/stripe` with signature verification
- [ ] **`checkout.session.completed` handler** — DB transaction: order→paid, voucher→active
- [ ] **`payment_intent.payment_failed` handler** — order→failed
- [ ] **Confirmation page** — polling for order status, success UI
- [ ] **Idempotency** — duplicate webhook detection via `Order.idempotency_key`
- [ ] **Feature tests** — checkout flow, webhook idempotency, failed payment, price mismatch

### Critical rule
> Voucher is ONLY created after verified Stripe webhook — never on frontend signal or redirect URL.

### Responsible agents
Ecommerce/Voucher Specialist · Stripe Payments Agent · Backend Laravel Lead

---

## PHASE 3 — Voucher System ⬜
> **Goal:** Complete voucher lifecycle — PDF, QR, email delivery, redemption, expiration
> **Estimated:** 1 week
> **Depends on:** Phase 2

### Deliverables

- [ ] **VoucherCodeGenerator** — `random_bytes()` based, `AIRONA-XXXX-XXXX-XXXX` format, DB-unique
- [ ] **VoucherStateMachine** — enforces valid transitions, throws on invalid moves
- [ ] **PDF generation** — Dompdf + `resources/views/pdf/voucher.blade.php` (brand, code, QR, expiry)
- [ ] **QR code generation** — embedded in PDF via SimpleSoftwareIO/simple-qrcode
- [ ] **Signed download URL** — `URL::temporarySignedRoute()`, 72h TTL
- [ ] **Email templates** — VoucherDeliveryMail (PDF attached), OrderConfirmationMail
- [ ] **Queue jobs** — GenerateVoucherPdfJob (high queue), SendVoucherEmailJob (default queue)
- [ ] **`voucher_audit_log`** — entries for all state transitions
- [ ] **`ExpireVouchersCommand`** — daily cron: active + expires_at < now → expired
- [ ] **`SendVoucherExpirySoonRemindersCommand`** — daily cron: 30-day warning emails
- [ ] **Feature tests** — redemption, double-redemption prevention, expiry, PDF generation

### Responsible agents
Ecommerce/Voucher Specialist · Backend Laravel Lead

---

## PHASE 4 — Public Frontend ⬜
> **Goal:** All public marketing pages rendered, SEO-ready, multilingual, mobile-first
> **Estimated:** 2 weeks
> **Depends on:** Phase 1 (Products API)

### Deliverables

- [ ] **`vite-ssg`** — SSG build pipeline, pre-rendered HTML per route
- [ ] **`MetaTags` component** — react-helmet-async, title/description/canonical/OG
- [ ] **`SchemaOrg` component** — JSON-LD injection (LocalBusiness, Product, FAQPage, Article)
- [ ] **`HreflangTags` component** — all locale variants + x-default
- [ ] **`LazyImage` component** — WebP, aspect-ratio, hero preload support
- [ ] **Multilingual routing** — `/:lang/` prefix, translated slug map, language detection
- [ ] **i18n translation files** — all 4 locales (es, ca, fr, en), all page namespaces
- [ ] **Header / Footer / Navigation / LanguageSwitcher**
- [ ] **Homepage** — Hero, ExperienceHighlights, TrustSection, Testimonials, FaqSnippet, CTA
- [ ] **Experience pages** — SharedFlight, PrivateFlight, GiftExperience (with add-to-cart)
- [ ] **CartPage + CartDrawer**
- [ ] **CheckoutPage** — form + Stripe redirect
- [ ] **ConfirmationPage** — success UI + voucher download button
- [ ] **Blog pages** — BlogListPage, BlogPostPage
- [ ] **FAQ page** — FAQPage schema
- [ ] **About, FlightZone, Contact pages**
- [ ] **Sitemap Vite plugin** — generates sitemap-index.xml at build time
- [ ] **robots.txt** — disallows admin, checkout, cart routes

### SEO note
> Pre-rendered HTML means crawlers receive fully-formed `<head>` with meta tags, hreflang, and structured data — no JavaScript execution required.

### Responsible agents
Frontend React Lead · UI/UX Designer

---

## PHASE 5 — Admin Panel ⬜
> **Goal:** Complete admin panel — product management, voucher operations, orders
> **Estimated:** 2 weeks
> **Depends on:** Phase 2, Phase 3

### Deliverables

- [ ] **Dashboard** — KPI cards (vouchers/revenue this month/year, YoY), revenue chart (Recharts), top products, recent orders
- [ ] **Product CRUD** — multilingual tabs, image upload, visibility toggle, archive
- [ ] **Voucher list** — TanStack Table, server-side filter (status, date, search)
- [ ] **Voucher detail** — status, code, QR preview, audit log timeline
- [ ] **Voucher validate page** — QR scanner (jsQR) + manual code entry → two-step confirmation
- [ ] **Order list + detail** — refund action (superadmin only)
- [ ] **Promotions CRUD** — code, discount type/value, validity, max uses, applicable products
- [ ] **Blog post editor** — multilingual content, publish/draft/archive
- [ ] **User management** — superadmin only
- [ ] **Role-based access** — admin vs superadmin policies enforced end-to-end

### Responsible agents
Frontend React Lead · Backend Laravel Lead

---

## PHASE 6 — Security Hardening ⬜
> **Goal:** Production-grade security posture, GDPR compliance, full audit logging
> **Estimated:** 1 week
> **Depends on:** Phase 4, Phase 5

### Deliverables

- [ ] **Rate limiting** — all sensitive endpoints (auth, checkout, promo, redeem)
- [ ] **Secure headers middleware** — CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- [ ] **Audit logging** — all admin voucher/order actions → `voucher_audit_log`
- [ ] **Cookie consent banner** (frontend) — gates analytics behind explicit consent
- [ ] **Privacy Policy CMS page**
- [ ] **GDPR data retention command** — annual anonymisation of old records
- [ ] **Stripe IP allowlist middleware** — log violations (defense in depth)
- [ ] **PHPStan** — level 6, zero violations in CI

### Responsible agents
Security/Compliance Agent · Backend Laravel Lead

---

## PHASE 7 — QA & Performance ⬜
> **Goal:** Full test coverage of critical paths, Core Web Vitals passing, production-ready
> **Estimated:** 1 week
> **Depends on:** Phase 5, Phase 6

### Deliverables

- [ ] **Pest feature tests** — checkout, webhook, voucher lifecycle, admin auth, refunds (90%+ critical path coverage)
- [ ] **Vitest unit tests** — cart store, form validation, API error handling
- [ ] **Playwright E2E** — checkout happy path, admin redemption, promo code
- [ ] **Stripe CLI webhook integration** in CI (`stripe trigger checkout.session.completed`)
- [ ] **Lighthouse CI** — LCP < 2.5s, CLS < 0.1, INP < 200ms enforced in GitHub Actions
- [ ] **Load test** — checkout endpoint at 50 concurrent requests

### Critical test scenarios
| Scenario | Expected |
|----------|---------|
| Purchase → webhook → voucher | Voucher active, PDF generated, email sent |
| Failed payment webhook | No voucher created, order failed |
| Duplicate webhook | Idempotent — no duplicate vouchers |
| Double redemption | 422 VoucherAlreadyRedeemedException |
| Expired voucher redemption | 422 VoucherExpiredException |
| Promo: exhausted | Validation error |
| Promo race condition | Only one winner when max_uses=1 |
| Admin without auth | 401 |

### Responsible agents
QA/Testing Agent · Frontend React Lead

---

## PHASE 8 — Staging & Launch ⬜
> **Goal:** Production infrastructure live, staging validated, go-live checklist complete
> **Estimated:** 1 week
> **Depends on:** Phase 7

### Deliverables

- [ ] **Production server** — VPS or cloud instance, Docker + Nginx deployed
- [ ] **SSL** — Let's Encrypt or Cloudflare origin certificate
- [ ] **GitHub Actions production pipeline** — manual approval gate
- [ ] **Stripe live keys** — production webhook endpoint registered in Stripe Dashboard
- [ ] **Sentry** — error tracking backend (Laravel) + frontend (React)
- [ ] **Uptime monitor** — external ping on `/api/v1/products`
- [ ] **Database backups** — daily `pg_dump` → Cloudflare R2, 30-day retention
- [ ] **DNS** — www + naked domain → Cloudflare → Nginx
- [ ] **Smoke tests** — all public pages 200, checkout creates Stripe session, admin login works
- [ ] **Pre-launch checklist** — Stripe live keys, webhook URL updated, CORS production domain, `APP_DEBUG=false`

### Responsible agents
DevOps Infrastructure Agent · Orchestrator

---

## MVP SCOPE

Phases 0–8 constitute the MVP. The platform is considered MVP-ready when:

1. Visitors can browse flight experiences in 4 languages
2. Visitors can purchase vouchers via Stripe and receive PDF by email
3. Vouchers are redeemable once via the admin panel
4. Admin can manage products, view orders, validate vouchers, manage promotions
5. All critical paths have test coverage
6. Platform is deployed to production with SSL and monitoring

---

## POST-MVP ROADMAP

### Phase A — Booking Calendar (Month 3–4) ⬜
- Date-based flight slot availability
- Voucher → booking reservation flow
- Admin flight schedule management
- Booking confirmation emails
- **Agents:** Backend Lead, Frontend Lead, Product Owner

### Phase B — Advanced Analytics & CRM (Month 4–5) ⬜
- Customer lifetime value tracking
- Email marketing integration (Mailchimp/Brevo) opt-in at checkout
- Automated voucher expiry email sequences
- Advanced admin reports (revenue by product, locale, promo attribution)
- **Agents:** Backend Lead, Solution Architect

### Phase C — Affiliate Programme (Month 5–6) ⬜
- Unique referral link generation per affiliate
- Commission tracking per voucher sold
- Affiliate dashboard + payout management
- **Agents:** Backend Lead, Product Owner, Security Agent

### Phase D — Multi-currency & Language Expansion (Month 6+) ⬜
- Additional languages: German, Italian
- Multi-currency checkout (EUR default, GBP, CHF via Stripe)
- Country-specific pricing and VAT rules
- **Agents:** Solution Architect, Frontend Lead, Stripe Payments Agent

---

## SCALABILITY TRIGGERS

| Trigger | Solution |
|---------|---------|
| > 50k monthly visitors | Cloudflare CDN (already in stack), Redis page cache, PostgreSQL read replica |
| > 10k vouchers/month | Queue workers scale horizontally, PgBouncer connection pooling |
| Multi-destination expansion | `destination` field on products, franchise-level admin permissions |
| B2B corporate bulk vouchers | Bulk order flow, invoice generation, net-30 via Stripe, corporate portal |
| Real-time availability | Laravel Reverb WebSockets, booking slot management |

---

## TECH STACK REFERENCE

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend framework | React | 19 |
| Frontend build | Vite + vite-ssg | 8 |
| Frontend language | TypeScript | 6 |
| CSS | TailwindCSS | 4 |
| UI primitives | shadcn/ui | — |
| Server state | React Query (@tanstack) | 5 |
| Client state | Zustand | 5 |
| Forms | React Hook Form + Zod | 7 + 4 |
| i18n | i18next + react-i18next | 26 + 17 |
| SEO | react-helmet-async | 3 |
| HTTP client | Axios | 1 |
| Backend framework | Laravel | 12 |
| PHP | PHP | 8.4 |
| Database | PostgreSQL | 16 |
| Cache / Queue / Sessions | Redis | 7 |
| Auth | Laravel Sanctum | 4 |
| Payments | Stripe PHP SDK | 20 |
| PDF generation | barryvdh/laravel-dompdf | 3 |
| QR codes | simplesoftwareio/simple-qrcode | 4 |
| Backend tests | Pest PHP | 3 |
| Frontend tests | Vitest | 4 |
| E2E tests | Playwright | 1.60 |
| Web server | Nginx | 1.27 |
| Containerisation | Docker + Compose | — |
| CI/CD | GitHub Actions | — |
