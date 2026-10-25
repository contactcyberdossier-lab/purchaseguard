# PurchaseGuard — Complete Production MVP

> **"Track purchases. Never miss a return deadline."**

PurchaseGuard is a production-ready, globally available, mobile-responsive web application designed to help consumers track online purchases, deliveries, return windows, warranties, receipts, refunds, and price-drop opportunities in one secure, privacy-first platform.

---

## 1. Important Claims Policy & Approved Positioning
> **Approved positioning statement:**
> *"PurchaseGuard helps you track purchases and prepare return, refund, warranty, and price-match requests. The retailer or manufacturer makes the final decision."*
>
> - **Do NOT** promise guaranteed retailer refunds.
> - **Do NOT** promise guaranteed recovered money.
> - **Do NOT** promise guaranteed warranty approval.
> - **Do NOT** promise guaranteed savings.
> - **Scope:** The application organizes purchases and prepares claim templates. Retailers, carriers, and manufacturers make all final decisions.

---

## 2. All 22 Deliverables Manifest

| # | Deliverable | Location in Codebase |
|---|---|---|
| **1** | Complete project folder structure | See directory tree below |
| **2** | Full frontend code | [`src/app/`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/src/app), [`src/components/`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/src/components) |
| **3** | Full backend/API code | [`src/app/api/`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/src/app/api) |
| **4** | Background worker code | [`src/workers/emailSyncWorker.ts`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/src/workers/emailSyncWorker.ts), [`src/workers/reminderWorker.ts`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/src/workers/reminderWorker.ts) |
| **5** | Supabase SQL migrations | [`supabase/migrations/20261025000000_initial_schema.sql`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/supabase/migrations/20261025000000_initial_schema.sql) |
| **6** | Row-level security policies | [`supabase/migrations/20261025000001_row_level_security.sql`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/supabase/migrations/20261025000001_row_level_security.sql), [`...0002_storage_and_indexes.sql`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/supabase/migrations/20261025000002_storage_and_indexes.sql) |
| **7** | Environment variable template | [`.env.example`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/.env.example) |
| **8** | Gmail OAuth setup instructions | [`docs/GMAIL_OAUTH_SETUP.md`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/docs/GMAIL_OAUTH_SETUP.md) |
| **9** | Microsoft Graph OAuth setup instructions | [`docs/MICROSOFT_GRAPH_SETUP.md`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/docs/MICROSOFT_GRAPH_SETUP.md) |
| **10** | Stripe setup instructions | [`docs/STRIPE_SETUP.md`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/docs/STRIPE_SETUP.md) |
| **11** | AfterShip / Shippo integration instructions | [`docs/TRACKING_INTEGRATION.md`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/docs/TRACKING_INTEGRATION.md) |
| **12** | Email parser implementation | [`src/lib/email/parser.ts`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/src/lib/email/parser.ts) |
| **13** | AI extraction prompt & universal JSON schema | [`src/lib/email/aiExtractor.ts`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/src/lib/email/aiExtractor.ts) |
| **14** | Return/refund/warranty/price-match templates | [`src/components/purchases/ClaimTemplateModal.tsx`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/src/components/purchases/ClaimTemplateModal.tsx) |
| **15** | Privacy policy draft | [`src/app/[locale]/privacy/page.tsx`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/src/app/[locale]/privacy/page.tsx) |
| **16** | Terms of service draft | [`src/app/[locale]/terms/page.tsx`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/src/app/[locale]/terms/page.tsx) |
| **17** | Cookie policy draft | [`src/app/[locale]/cookies/page.tsx`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/src/app/[locale]/cookies/page.tsx) |
| **18** | Security checklist | [`docs/SECURITY_CHECKLIST.md`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/docs/SECURITY_CHECKLIST.md) |
| **19** | Unit and integration tests | [`tests/unit/deadlines.test.ts`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/tests/unit/deadlines.test.ts), [`security.test.ts`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/tests/unit/security.test.ts), [`emailParser.test.ts`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/tests/unit/emailParser.test.ts) |
| **20** | End-to-end tests with Playwright | [`tests/e2e/app.spec.ts`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/tests/e2e/app.spec.ts) |
| **21** | CI/CD pipeline | [`.github/workflows/ci.yml`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/.github/workflows/ci.yml) |
| **22** | Deployment configuration & Docker | [`Dockerfile`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/Dockerfile), [`docker-compose.yml`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/docker-compose.yml), [`README.md`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/README.md) |

---

## 3. Tech Stack

- **Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide icons, shadcn/ui design tokens
- **Internationalization (i18n):** Multi-locale routing supporting 9 launch languages:
  - English (`en` — default), Spanish (`es`), French (`fr`), German (`de`), Portuguese (`pt`), Italian (`it`), Dutch (`nl`), Hindi (`hi`), Arabic (`ar` — full RTL layout support).
- **Authentication & Database:** Supabase Auth (SSR Client, Email/Password, Google OAuth, Apple Sign-In) + PostgreSQL with Row-Level Security (RLS)
- **Payments:** Stripe Subscriptions (Free, Plus $5/mo, Annual $49/yr) + Stripe Tax automatic calculation + Customer Portal
- **Email Intelligence:** Gmail API (`gmail.readonly`) and Microsoft Graph API (`Mail.Read`), inbound receipt forwarding (`receipts@purchaseguard.app`), MIME decoding, rule-based retailer detection, and AI universal extraction with strict confidence scoring
- **Carrier Tracking:** AfterShip Tracking API / Shippo API multi-carrier real-time tracking
- **Storage:** Private Supabase Storage bucket (`receipts`) with user-isolated RLS and time-limited signed download URLs
- **Security:** OWASP Top 10 / ASVS compliance, AES-256-GCM token encryption at rest, SHA-256 privacy hashing, strict CSP and HTTP headers
- **CI/CD & Testing:** Vitest, React Testing Library, Playwright, GitHub Actions

---

## 4. Complete Project Directory Tree

```text
purchaseguard/
├── .env.example                                      # Production environment variable template
├── .github/
│   └── workflows/
│       └── ci.yml                                    # GitHub Actions CI/CD pipeline
├── Dockerfile                                        # Multi-stage production container
├── docker-compose.yml                                # Compose setup for Web + Sync & Reminder Workers
├── README.md                                         # Master documentation
├── package.json                                      # Dependencies & npm scripts
├── tsconfig.json                                     # TypeScript compiler configuration
├── tailwind.config.ts                                # Tailwind CSS design tokens & dark mode
├── postcss.config.mjs                                # PostCSS config
├── next.config.mjs                                   # Strict CSP & security headers
├── vitest.config.ts                                  # Vitest unit test runner config
├── playwright.config.ts                              # Playwright E2E browser test runner config
├── docs/                                             # Production integration guides
│   ├── GMAIL_OAUTH_SETUP.md                          # Google Cloud OAuth 2.0 setup
│   ├── MICROSOFT_GRAPH_SETUP.md                      # Azure Entra ID Graph setup
│   ├── STRIPE_SETUP.md                               # Stripe Checkout, Tax, and Portal setup
│   ├── TRACKING_INTEGRATION.md                       # AfterShip and Shippo tracking setup
│   └── SECURITY_CHECKLIST.md                         # OWASP ASVS verification checklist
├── messages/                                         # Translation files (No hardcoded strings)
│   ├── en.json                                       # English (Default)
│   ├── es.json                                       # Spanish
│   ├── fr.json                                       # French
│   ├── de.json                                       # German
│   ├── pt.json                                       # Portuguese
│   ├── it.json                                       # Italian
│   ├── nl.json                                       # Dutch
│   ├── hi.json                                       # Hindi
│   └── ar.json                                       # Arabic (RTL Layout)
├── supabase/
│   └── migrations/
│       ├── 20261025000000_initial_schema.sql         # 10 core tables, triggers & indices
│       ├── 20261025000001_row_level_security.sql     # Zero-trust Row-Level Security policies
│       └── 20261025000002_storage_and_indexes.sql    # Private storage bucket & storage RLS policies
├── tests/
│   ├── unit/
│   │   ├── deadlines.test.ts                         # Return rules & countdown calculation tests
│   │   ├── security.test.ts                          # AES-256-GCM encryption & sanitization tests
│   │   └── emailParser.test.ts                       # Classification & universal schema tests
│   └── e2e/
│       └── app.spec.ts                               # Playwright multi-locale & RTL tests
├── src/
│   ├── middleware.ts                                 # i18n routing, Supabase auth guard & security headers
│   ├── lib/
│   │   ├── deadlines.ts                              # Retailer policy rules & countdown calculations
│   │   ├── reminders.ts                              # Automated reminder calculation & sync
│   │   ├── storage.ts                                # Receipt file validation & signed download URLs
│   │   ├── stripe.ts                                 # Stripe SDK, pricing plans & portal
│   │   ├── tracking.ts                               # Package tracking integration (AfterShip/Shippo)
│   │   ├── notifications.ts                          # Resend/Postmark transactional alert templates
│   │   ├── i18n.ts                                   # Localization, RTL helper, currency & date formatters
│   │   ├── security.ts                               # AES-256-GCM token encryption & SHA-256 hashing
│   │   ├── utils.ts                                  # Tailwind merge helper
│   │   ├── email/
│   │   │   ├── parser.ts                             # MIME decoding, stripHtml & retailer matchers
│   │   │   └── aiExtractor.ts                        # Universal JSON schema & structured extractor
│   │   ├── oauth/
│   │   │   ├── gmail.ts                              # Google OAuth 2.0 flow & token refresh
│   │   │   └── outlook.ts                            # Microsoft Graph OAuth flow & token refresh
│   │   ├── supabase/
│   │   │   ├── client.ts                             # Supabase browser client
│   │   │   ├── server.ts                             # Supabase server client (cookies)
│   │   │   └── middleware.ts                         # Supabase session updater
│   │   └── validations/
│   │       ├── auth.ts                               # Zod schemas for login, register, reset
│   │       ├── purchase.ts                           # Zod schemas for purchases & 18 currencies
│   │       └── settings.ts                           # Zod schemas for user profile & preferences
│   ├── workers/
│   │   ├── emailSyncWorker.ts                        # Background email sync worker (Railway/Render/Fly.io)
│   │   └── reminderWorker.ts                         # Automated deadline reminders worker
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx, Card.tsx, LanguageSelector.tsx, ThemeToggle.tsx
│   │   ├── landing/
│   │   │   ├── Header.tsx, Hero.tsx, HowItWorks.tsx, Features.tsx, Pricing.tsx, SecurityPrivacy.tsx, FAQ.tsx, Footer.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx, RegisterForm.tsx, ResetPasswordForm.tsx, SocialAuthButtons.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardHeader.tsx, DashboardSidebar.tsx, StatsOverview.tsx, QuickActions.tsx, RecentPurchasesList.tsx, EmailConnectionsCard.tsx
│   │   ├── purchases/
│   │   │   ├── PurchaseModal.tsx                     # Manual entry & edit modal with retailer detection
│   │   │   ├── ReceiptUploader.tsx                   # Drag-and-drop receipt uploader
│   │   │   ├── PurchaseFilters.tsx                   # Filter pills, search bar & sort selector
│   │   │   ├── DeadlineCountdownBadge.tsx            # Visual status countdown badges
│   │   │   ├── ClaimTemplateModal.tsx                # 5 return/refund/warranty claim templates
│   │   │   ├── TrackingTimeline.tsx                  # Real-time multi-step carrier delivery progress
│   │   │   └── DeleteConfirmModal.tsx                # Accessible purchase deletion modal
│   │   ├── billing/
│   │   │   └── PricingTable.tsx                      # In-app subscription tier selector & 14d guarantee notice
│   │   └── settings/
│   │       └── SettingsTabs.tsx                      # Profile, Notifications & Privacy management
│   └── app/
│       ├── globals.css                               # Tailwind variables & RTL support
│       ├── layout.tsx                                # Root metadata layout
│       ├── [locale]/
│       │   ├── layout.tsx                            # Locale wrapper with dir="rtl" or "ltr"
│       │   ├── page.tsx                              # Public marketing landing page
│       │   ├── privacy/page.tsx                      # GDPR/CCPA Privacy Policy
│       │   ├── terms/page.tsx                        # Terms of Service with claims disclaimer
│       │   ├── cookies/page.tsx                      # Cookie policy
│       │   ├── (auth)/
│       │   │   ├── login/page.tsx, register/page.tsx, forgot-password/page.tsx
│       │   └── (dashboard)/
│       │       └── dashboard/
│       │           ├── layout.tsx                    # Authenticated dashboard wrapper
│       │           ├── page.tsx                      # Dashboard overview & stats
│       │           ├── purchases/
│       │           │   ├── page.tsx                  # Purchases list & filters
│       │           │   └── [id]/page.tsx             # Purchase detail view with receipt vault & tracking
│       │           ├── billing/
│       │           │   └── page.tsx                  # Plan selection, billing portal & invoice history
│       │           └── settings/
│       │               └── page.tsx                  # Account & privacy settings
│       └── api/
│           ├── auth/
│           │   ├── callback/route.ts                 # Supabase Auth OAuth callback
│           │   └── oauth/
│           │       ├── google/route.ts, google/callback/route.ts
│           │       └── microsoft/route.ts, microsoft/callback/route.ts
│           ├── purchases/
│           │   ├── route.ts                          # GET (filtered list) & POST (create purchase)
│           │   └── [id]/
│           │       ├── route.ts                      # GET, PUT, DELETE purchase
│           │       └── attachments/route.ts          # POST upload receipt attachment
│           ├── billing/
│           │   ├── checkout/route.ts                 # Stripe Checkout session creator
│           │   ├── portal/route.ts                   # Stripe Customer Billing Portal session
│           │   └── webhook/route.ts                  # Stripe Webhook listener & subscription sync
│           ├── email-connections/
│           │   └── route.ts                          # List, disconnect & purge email connections
│           ├── webhooks/
│           │   └── inbound-email/route.ts            # Forwarded order email processor
│           └── user/
│               ├── settings/route.ts                 # GET & PUT user profile settings
│               ├── export/route.ts                   # GET export user data bundle (GDPR/CCPA)
│               └── delete/route.ts                   # POST permanently purge user account
```

---

## 5. Local Setup & Production Quickstart

### 1. Prerequisites
- Node.js 20+
- A Supabase Project (PostgreSQL + Auth + Storage)
- A Stripe Account (for billing)
- A Google Cloud & Microsoft Azure App (for read-only email sync)

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in the credentials as instructed in the respective setup guides in [`docs/`](file:///c:/Users/pmani/Documents/antigravity/quirky-bell/purchaseguard/docs).

### 3. Apply Database Migrations
Apply the migrations in order:
```bash
# Using Supabase CLI:
supabase db push

# Or execute sequentially in the Supabase SQL editor:
# 1. supabase/migrations/20261025000000_initial_schema.sql
# 2. supabase/migrations/20261025000001_row_level_security.sql
# 3. supabase/migrations/20261025000002_storage_and_indexes.sql
```

### 4. Install Dependencies, Build, and Run
```bash
npm install
npm run build
npm run start
```
Open [http://localhost:3000](http://localhost:3000).

### 5. Running the Background Workers
Run the background workers via Node.js or Docker:
```bash
# Email sync worker:
npm run worker:email

# Deadline reminders worker:
npm run worker:reminders

# Or with Docker Compose:
docker-compose up -d
```

### 6. Executing Tests
```bash
# Run unit and integration tests (Vitest)
npm run test

# Run end-to-end browser tests (Playwright)
npm run test:e2e
```
