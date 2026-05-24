# PROJECT — BALLOON EXPERIENCE PLATFORM

## PROJECT OVERVIEW

This project is a modern premium web platform for a hot air balloon company inspired by AIRONA Globus.

The new platform is NOT a simple redesign.

It is a:
- modernized platform
- scalable ecommerce system
- multilingual tourism platform
- voucher management system
- SEO-first business platform

The website must feel:
- modern
- cinematic
- premium
- elegant
- emotional
- lightweight
- visually attractive without being overloaded

The design must prioritize:
- large imagery
- emotional storytelling
- premium tourism aesthetics
- strong calls to action
- smooth UX
- mobile-first experience

---

# MAIN BUSINESS GOALS

The main business objectives are:

- sell balloon flight vouchers
- improve SEO positioning
- increase conversion rate
- modernize brand image
- simplify voucher purchases
- improve mobile UX
- provide scalable admin management
- support multilingual tourism marketing

---

# MAIN WEBSITE STRUCTURE

The public website structure should be heavily inspired by:

https://www.aironaglobus.com/

The new platform should preserve a similar information architecture while significantly improving:
- UX
- visual design
- ecommerce flow
- responsiveness
- performance
- SEO

---

# PUBLIC WEBSITE PAGES

## Homepage

The homepage should include:
- cinematic hero section
- emotional storytelling
- flight experience highlights
- CTA to purchase vouchers
- flight information
- trust sections
- reviews/testimonials
- FAQ snippets
- contact CTA

The homepage must prioritize conversion.

---

## Flight Experiences

Pages for:
- shared balloon flights
- private balloon flights
- gift experiences
- special experiences/promotions

Each experience page should include:
- large visuals
- pricing
- experience details
- included services
- FAQs
- CTA to purchase

---

## Voucher Purchase Section

IMPORTANT:
The term "Compras" should NOT be used.

Preferred naming ideas:
- Gift Experiences
- Reserve Your Experience
- Flight Vouchers
- Balloon Experiences
- Gift Flights

This section is the ecommerce area.

Users should be able to:
- browse experiences
- add products to cart
- purchase vouchers
- receive vouchers by email
- download vouchers after purchase

---

## About Us

Company presentation:
- pilots
- philosophy
- safety
- experience
- company story

---

## Flight Area

Information about:
- Empordà
- Costa Brava
- landscapes
- sunrise experience
- launch zones

SEO-focused content.

---

## FAQ

Must include:
- weather conditions
- cancellations
- voucher validity
- age restrictions
- weight restrictions
- booking process
- safety information

---

## Contact

Includes:
- contact form
- map
- email
- phone
- social links

---

## Blog

SEO-focused blog.

Topics:
- balloon flights
- tourism
- Costa Brava
- Empordà
- romantic experiences
- travel experiences

The blog is important for SEO strategy.

---

# MULTILANGUAGE SUPPORT

Supported languages:
- Spanish (default)
- Catalan
- French
- English

Requirements:
- SEO-friendly URLs
- translated metadata
- translated slugs where possible
- proper hreflang implementation

SEO internationalization is VERY important.

---

# ADMIN PANEL

## Route

Protected admin route:

/admin

Authentication required.

Only authorized users may access the admin panel.

---

# ADMIN FEATURES

## Dashboard

Dashboard should display:
- vouchers sold this month
- vouchers sold this year
- comparisons with previous years
- revenue statistics
- top-selling experiences
- recent purchases
- conversion metrics

---

## Product Management

Admins must be able to:
- create products
- edit products
- archive products
- enable/disable visibility
- manage prices
- manage descriptions
- upload images

Products control what appears publicly on the website.

If no products are visible:
- ecommerce section should not appear publicly.

---

## Promotions & Offers

Admins must be able to:
- create offers
- assign discounts
- apply promotions to products
- activate/deactivate campaigns
- configure validity periods

---

## Voucher Management

Admins must be able to:
- view sold vouchers
- validate vouchers
- mark vouchers as redeemed
- resend vouchers by email
- search vouchers
- view voucher status

---

# VOUCHER SYSTEM

The voucher system is one of the MOST IMPORTANT features.

---

# VOUCHER RULES

Each voucher:
- has a unique code
- is generated after successful payment
- is downloadable as PDF
- is sent by email
- is redeemable once
- has a validity of 1 year from purchase date

The validity MUST be clearly communicated:
- before checkout
- during checkout
- after purchase
- inside the voucher PDF

---

# VOUCHER STATES

Voucher states:
- pending_payment
- paid
- active
- redeemed
- expired
- refunded
- cancelled

---

# PURCHASE FLOW

## Purchase Process

User flow:

1. User browses experiences
2. User adds experience to cart
3. User proceeds to checkout
4. User enters:
   - email
   - billing information
5. User completes payment
6. Voucher is generated
7. Voucher email is sent
8. Download button appears
9. Voucher becomes active

---

# CART SYSTEM

The platform should include:
- shopping cart
- cart persistence
- quantity management
- discount support
- promo code support
- responsive checkout UX

The checkout must feel:
- fast
- premium
- trustworthy
- modern

---

# EMAIL SYSTEM

The system should send:
- purchase confirmation
- voucher delivery
- payment confirmation
- reminder emails
- support emails

Emails should:
- look premium
- be mobile-friendly
- include branding
- include voucher information

---

# SEO REQUIREMENTS

SEO is one of the HIGHEST priorities of the project.

The platform must be designed SEO-first.

---

# SEO GOALS

Primary SEO objectives:
- rank for balloon flight searches
- rank for tourism experience searches
- rank for Costa Brava / Empordà searches
- rank for gift experience searches

---

# SEO REQUIREMENTS

Must include:
- optimized metadata
- Open Graph support
- Schema.org structured data
- fast performance
- optimized Core Web Vitals
- image optimization
- multilingual SEO
- sitemap generation
- canonical URLs
- proper heading hierarchy

---

# TARGET KEYWORDS

Examples:
- vuelo en globo Girona
- vuelo en globo Costa Brava
- vuelo en globo Empordà
- experiencia en globo
- regalo vuelo en globo
- vuelo romántico en globo

---

# TECH STACK

## Frontend

- React.js
- Vite
- TypeScript
- TailwindCSS
- shadcn/ui
- React Query
- Zustand

---

## Backend

- Laravel 12
- PostgreSQL
- Redis
- Sanctum
- Stripe integration

---

## Infrastructure

- Docker
- Nginx
- GitHub Actions

---

# DESIGN DIRECTION

The visual style should communicate:
- freedom
- calm luxury
- sunrise atmosphere
- exclusivity
- adventure
- elegance

Avoid:
- visual overload
- excessive animations
- cluttered layouts
- generic tourism aesthetics

The platform should feel premium and modern.

---

# ARCHITECTURE PRINCIPLES

The application must be:
- scalable
- modular
- maintainable
- API-first
- SEO-oriented

Domains should remain separated:
- Auth
- Ecommerce
- Payments
- Vouchers
- Bookings
- CMS
- Notifications

---

# FUTURE FEATURES

Potential future features:
- booking calendar
- real-time availability
- CRM integrations
- affiliate system
- advanced analytics
- marketing automations
- multilingual blog CMS

---

# MOST IMPORTANT PRODUCT GOAL

The platform should not feel like:
- a basic tourism website

It should feel like:
- purchasing a premium unforgettable experience.