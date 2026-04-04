# J-address CLAUDE.md

> Versions verified via context7 on 2026-04-04

## Project Overview

**J-address** is a virtual Japanese mail address service. Users get a Japanese address, receive physical mail there, and manage it online — choosing to forward (SEND), scan (SCAN), or discard (DISCARD) each item.

Target market: Japanese diaspora abroad, foreign residents in Japan, digital nomads.

---

## Monorepo Structure

```
J-app/
├── apps/
│   ├── api/          # NestJS backend (port 3001)
│   └── web/          # Next.js frontend (port 3000)
└── packages/
    └── shared/       # Shared TypeScript types and DTOs
```

---

## Tech Stack

### Current (implemented)

| Layer | Technology | Verified Version |
|---|---|---|
| Frontend framework | Next.js | **16.2.2** |
| UI library | React | **19.2.0** |
| Language | TypeScript | **6.0.2** |
| Styling | Tailwind CSS | **4.x** |
| UI components | Headless UI | 2.x |
| Backend framework | NestJS | **11.1.16** |
| Runtime | Node.js | 24.x |
| ORM | Prisma | **7.5.0** |
| Database | PostgreSQL | 16.x |
| Auth | Passport.js + JWT | — |
| Password hashing | bcrypt | 6.x |
| Validation | class-validator + class-transformer | — |
| Testing | Jest | 30.x |
| API testing | Supertest | 7.x |
| TS test transform | ts-jest | 29.x |
| Package manager | pnpm | 9.x |

### Planned (add in order)

| Priority | Technology | Verified Version | Purpose |
|---|---|---|---|
| Now | Biome | **2.2.4** | Replace ESLint+Prettier — faster, zero-config |
| Now | Zod | **4.0.1** | Replace class-validator — unified validation across frontend and backend |
| Soon | Redux Toolkit + RTK Query | **2.11.0** | Frontend state + API cache management |
| Soon | Redis (ioredis) | **5.4.0** | Session cache, real-time adapter, JWT blacklist |
| Soon | Socket.io | **4.x** | Real-time inbox notifications when mail arrives |
| Soon | AWS S3 + CloudFront | SDK v3 | Storage for scanned mail images (`imageUrl`) |
| Soon | Stripe Node | **19.1.0** | Subscription billing — core to the business model |
| Soon | SendGrid + MJML | — | Mail arrival notification emails to users |
| Soon | Sentry | latest | Production error monitoring — must have before launch |
| Later | @anthropic-ai/sdk (Claude) | latest | Auto-classify mail content, OCR summary |
| Later | Google OAuth | — | Reduce signup friction |
| Later | Google Maps | — | Address input UX for forwarding destinations |
| Later | Playwright | **1.58.2** | E2E tests for critical user flows |
| Later | shadcn/ui | latest | User-facing + admin components — owns the code, built on Radix UI + Tailwind, RSC native |
| Later | wanakana | — | Japanese kana input conversion for address forms |
| Later | awesome-phonenumber | — | Japanese phone number validation |
| Later | zengin-code | — | Bank transfer feature for billing |

---

## Version Notes (context7 verified)

Major version jumps to be aware of — these have breaking changes:

| Technology | Previously assumed | Verified latest | Breaking? |
|---|---|---|---|
| Prisma | 6.x | **7.5.0** | Yes — client API changes |
| TypeScript | 5.9 | **6.0.2** | Yes — strictness changes |
| Zod | 3.x | **4.0.1** | Yes — API redesigned |
| MUI | v6 | dropped | Replaced by shadcn/ui — avoid version lock-in, RSC incompatibility |
| Biome | 1.x | **2.2.4** | Yes — config format changed |
| Vite | 6 | **8.0.0** | Yes — config changes |
| Playwright | 1.4x | **1.58.2** | Minor only |
| Redux Toolkit | 2.x | **2.11.0** | No |
| NestJS | 11 | **11.1.16** | No |
| Next.js | 15 | **16.2.2** | Minor only |
| React | 19.1 | **19.2.0** | No |
| Stripe Node | — | **19.1.0** | — |
| ioredis | — | **5.4.0** | — |

---

## Data Models

```prisma
User {
  id        String   (uuid)
  email     String   (unique)
  password  String   (bcrypt hashed)
  role      Role     (USER | ADMIN)
  inbox     Inbox[]
}

Inbox {
  id              Int
  imageUrl        String?       // S3 URL of scanned mail photo
  status          InboxStatus   (RECEIVED | ACTION_REQUESTED | COMPLETED)
  requestedAction ActionType    (NONE | SEND | SCAN | DISCARD)
  userId          String
}
```

---

## API Structure

Base URL: `http://localhost:3001`

| Module | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login` |
| Admin | Admin-only routes (role guard) |

Auth uses JWT Bearer tokens. Protected routes use `@UseGuards(JwtAuthGuard)`.

---

## Development Commands

```bash
# Install dependencies
pnpm install

# Run both apps
pnpm dev

# API only (port 3001)
cd apps/api && pnpm dev

# Web only (port 3000)
cd apps/web && pnpm dev

# Database
cd apps/api
pnpm prisma:migrate      # Run migrations
pnpm prisma:generate     # Generate Prisma client
pnpm prisma:studio       # Open DB GUI

# Tests
cd apps/api && pnpm test            # Unit tests
cd apps/api && pnpm test:cov        # Coverage
cd apps/api && pnpm test:e2e        # E2E tests

# Type check
pnpm typecheck
```

---

## Environment Variables

### apps/api/.env
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
FRONTEND_URL=http://localhost:3000
PORT=3001

# Add when implementing:
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
# AWS_S3_BUCKET=...
# AWS_CLOUDFRONT_URL=...
# STRIPE_SECRET_KEY=...
# SENDGRID_API_KEY=...
# ANTHROPIC_API_KEY=...
# SENTRY_DSN=...
# REDIS_URL=...
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
```

---

## Architecture Decisions

- **Monorepo** with `packages/shared` for types/DTOs used by both apps — keep API contracts in sync
- **Prisma over raw SQL** — type safety on DB operations is non-negotiable
- **JWT stateless auth** — no server-side sessions; add Redis (ioredis 5.4.0) when refresh token blacklisting is needed
- **class-validator now, Zod 4 soon** — migrate to Zod 4 for unified validation on both frontend and backend via shared schemas
- **Headless UI now, shadcn/ui later** — shadcn/ui replaces both Headless UI and MUI. Built on Radix UI + Tailwind, RSC-native, no version lock-in. MUI dropped — its CSS-in-JS model conflicts with RSC and creates React upgrade lag
- **S3 for imageUrl** — never store binary in PostgreSQL; `imageUrl` field is reserved for S3 object key
- **Biome over ESLint+Prettier** — Biome 2.x handles both formatting and linting in one tool with near-zero config

---

## Code Conventions

- All code in **TypeScript 6** — no `any`, use `unknown` if type is truly unknown
- NestJS: one module per feature (auth, admin, inbox, user...)
- DTOs in `apps/api/src/[module]/dto/` — shared response types go in `packages/shared`
- Guards: `JwtAuthGuard` for authentication, `RolesGuard` for authorization
- Never expose `password` field in API responses — use `Omit<User, 'password'>` or response DTOs
- Frontend: App Router only — no `pages/` directory

---

## Key Business Logic

- **Inbox flow**: Mail arrives → status `RECEIVED` → user sets `requestedAction` → status `ACTION_REQUESTED` → admin processes → status `COMPLETED`
- **Roles**: `USER` manages own inbox only. `ADMIN` can see all inboxes and process actions.
- **Billing model**: Monthly subscription per user (Stripe 19.x). Different tiers by mail volume.

---

## Canada Job Market Notes

Skills in this stack that are highly valued in Canada:
- Next.js + React 19 + TypeScript (A demand)
- NestJS + Node.js + PostgreSQL/Prisma (A/B demand)
- JWT/Passport + Google OAuth (A demand)
- AWS S3/CloudFront (A demand)
- Stripe (A demand)
- shadcn/ui — fastest growing UI library, dominant in modern Canada startups (A demand, rising)
- @anthropic-ai/sdk — AI integration is the fastest-growing skill in 2024-2025 (A demand)
- Playwright — overtaking Cypress in Canadian job listings (A demand)
- Redux Toolkit + RTK Query — required for senior React roles (A demand)
- Zod 4 — standard in modern TypeScript stacks (B demand, rising)
- Redis — near-universal in backend roles (A demand)
- Kubernetes — high salary impact but not needed for this project's current phase

## Technology Selection Rule

When choosing between two technologies that solve the same problem, prefer the one with:
1. Higher Canada job market demand (A > B > C)
2. Better fit with the existing stack (avoid adding a second styling system, second validation library, etc.)
3. Lower upgrade risk and lock-in

Examples already applied:
- shadcn/ui over MUI — RSC-native, no version lag, Tailwind already in stack, rising Canada demand
- Zod 4 over class-validator — works on both frontend and backend via shared package
- Biome over ESLint+Prettier — single tool, faster, simpler config
- PostgreSQL over MongoDB — relational data model fits J-app's domain
