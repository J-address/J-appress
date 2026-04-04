# J-address

Japanese virtual mail address service — receive physical mail at a Japanese address and manage it online (forward, scan, or discard).

> Versions verified via context7 on 2026-04-04

---

## Project Structure

```
J-app/
├── apps/
│   ├── web/                    # Next.js frontend (port 3000)
│   │   └── app/               # App Router pages
│   │       ├── page.tsx       # Home
│   │       ├── login/         # Login
│   │       ├── signup/        # Sign up
│   │       ├── inbox/         # Inbox management
│   │       └── contact/       # Contact
│   │
│   └── api/                   # NestJS backend (port 3001)
│       ├── src/
│       │   ├── auth/          # JWT auth, guards, strategies
│       │   ├── admin/         # Admin-only routes
│       │   └── prisma/        # Prisma service
│       └── prisma/
│           └── schema.prisma  # Database schema
│
└── packages/
    └── shared/                # Shared TypeScript types & DTOs
        └── src/
            ├── types/
            └── dto/
```

---

## Tech Stack

### Current

| Layer | Technology | Version |
|---|---|---|
| Frontend | Next.js | 16.2.2 |
| UI | React | 19.2.0 |
| Language | TypeScript | 6.0.2 |
| Styling | Tailwind CSS | 4.x |
| UI components | Headless UI | 2.x |
| Backend | NestJS | 11.1.16 |
| Runtime | Node.js | 24.x |
| ORM | Prisma | 7.5.0 |
| Database | PostgreSQL | 16.x |
| Auth | Passport.js + JWT | — |
| Testing | Jest + Supertest | 30.x |
| Package manager | pnpm | 9.x |

### Planned

| Technology | Version | Purpose |
|---|---|---|
| Biome | 2.2.4 | Replace ESLint+Prettier |
| Zod | 4.0.1 | Replace class-validator |
| Redux Toolkit + RTK Query | 2.11.0 | Frontend state management |
| Redis (ioredis) | 5.4.0 | Cache + real-time adapter |
| Socket.io | 4.x | Real-time inbox notifications |
| AWS S3 + CloudFront | SDK v3 | Scanned mail image storage |
| Stripe Node | 19.1.0 | Subscription billing |
| SendGrid + MJML | — | Email notifications |
| Sentry | latest | Production error monitoring |
| @anthropic-ai/sdk | latest | AI mail classification |
| Playwright | 1.58.2 | E2E testing |
| shadcn/ui | latest | UI components — user-facing + admin, RSC-native, built on Radix UI + Tailwind |

---

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm 9+
- Docker & Docker Compose

### Installation

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd J-app
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Set up environment variables

   `apps/api/.env`:
   ```env
   DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/jaddress_db"
   JWT_SECRET="your-secret-key"
   FRONTEND_URL=http://localhost:3000
   PORT=3001
   ```

   `apps/web/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. Start the database

   ```bash
   docker-compose up -d db
   ```

5. Run database migrations

   ```bash
   cd apps/api
   pnpm prisma:generate
   pnpm prisma:migrate
   ```

6. Start development servers

   ```bash
   # Both apps
   pnpm dev

   # Separately
   cd apps/api && pnpm dev   # API on :3001
   cd apps/web && pnpm dev   # Web on :3000
   ```

7. Access the application
   - Frontend: http://localhost:3000
   - API: http://localhost:3001
   - Prisma Studio: `cd apps/api && pnpm prisma:studio`

---

## Commands

### Root

```bash
pnpm dev          # Start both web and api
pnpm build        # Build all workspaces
pnpm lint         # Lint all workspaces
pnpm typecheck    # Type check all workspaces
pnpm test         # Run tests in all workspaces
```

### API

```bash
cd apps/api
pnpm test           # Unit tests
pnpm test:cov       # Coverage report
pnpm test:e2e       # E2E tests
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:studio
```

### Adding packages

```bash
pnpm add <package> --filter=@j-address/web
pnpm add <package> --filter=@j-address/api
pnpm add <package> --filter=@j-address/shared
```

---

## Database Schema

### User
| Field | Type | Notes |
|---|---|---|
| id | String (UUID) | Primary key |
| email | String | Unique |
| password | String | bcrypt hashed |
| role | Role | USER or ADMIN |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Inbox
| Field | Type | Notes |
|---|---|---|
| id | Int | Auto-increment |
| imageUrl | String? | S3 URL of scanned mail photo |
| status | InboxStatus | RECEIVED → ACTION_REQUESTED → COMPLETED |
| requestedAction | ActionType | NONE / SEND / SCAN / DISCARD |
| userId | String | Foreign key → User |
| createdAt | DateTime | |
| updatedAt | DateTime | |

---

## Inbox Flow

```
Mail arrives
    → status: RECEIVED
    → user sets requestedAction (SEND / SCAN / DISCARD)
    → status: ACTION_REQUESTED
    → admin processes the action
    → status: COMPLETED
```

---

## Shared Types

```typescript
import { InboxStatus, ActionType, User, Inbox } from "@j-address/shared";
```

---

## Docker

```bash
docker-compose up -d     # Start services
docker-compose down      # Stop services
docker-compose logs -f   # View logs
```

---

## License

ISC