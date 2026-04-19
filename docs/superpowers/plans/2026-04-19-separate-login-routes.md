# Separate Login Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `/login` into `/login` (user-only) and `/admin/login` (admin-only), with distinct visual themes, a shared `LoginForm` component, `httpOnly` cookie JWT storage, and Next.js middleware for server-side route protection.

**Architecture:** A Next.js Route Handler at `/api/auth/login` proxies login requests to the NestJS API and sets an `httpOnly` cookie on the Next.js domain so middleware can read it. A `themes.ts` file defines typed theme objects consumed by a shared `LoginForm` component. `middleware.ts` uses `jose` to decode the cookie JWT and enforces role-based route access before any page renders.

**Tech Stack:** Next.js 16 App Router, `jose` (edge-compatible JWT), TypeScript 6, Tailwind CSS 4, `@j-address/shared` (Role enum)

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Install | `apps/web/package.json` | Add `jose` dependency |
| Modify | `apps/web/.env.local` | Add `JWT_SECRET` for middleware |
| Create | `apps/web/srcs/themes.ts` | `userTheme` + `adminTheme` typed objects |
| Create | `apps/web/app/api/auth/login/route.ts` | BFF proxy: call NestJS, set httpOnly cookie |
| Create | `apps/web/srcs/components/login_form.tsx` | Shared form component (theme + variant props) |
| Modify | `apps/web/srcs/pages/login_page.tsx` | Refactor to use `LoginForm` with `userTheme` |
| Create | `apps/web/srcs/pages/admin_login_page.tsx` | Admin login page using `adminTheme` |
| Create | `apps/web/app/admin/login/page.tsx` | Route shell for `/admin/login` |
| Create | `apps/web/middleware.ts` | Edge middleware: decode cookie JWT, enforce routes |

---

## Task 1: Install `jose` and configure `JWT_SECRET`

**Files:**
- Modify: `apps/web/package.json`
- Modify: `apps/web/.env.local`

- [ ] **Step 1: Install jose**

```bash
cd apps/web && pnpm add jose
```

Expected output: `+ jose X.X.X` added to dependencies.

- [ ] **Step 2: Add JWT_SECRET to web .env.local**

Open `apps/web/.env.local` and add this line (use the same value as `apps/api/.env`):

```
JWT_SECRET=your_jwt_secret_key
```

> This must match the value in `apps/api/.env` exactly — both sides sign/verify with the same secret.

- [ ] **Step 3: Verify jose is importable**

```bash
cd apps/web && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/package.json apps/web/pnpm-lock.yaml
git commit -m "chore: add jose for edge-compatible JWT decoding"
```

---

## Task 2: Create theme system

**Files:**
- Create: `apps/web/srcs/themes.ts`

- [ ] **Step 1: Create the themes file**

Create `apps/web/srcs/themes.ts`:

```ts
export const userTheme = {
  background: 'linear-gradient(180deg, #d8dadd 3%, #c0dfff 16%, #6aa2f0 36%, #0155c3 90%)',
  card: 'bg-white/10 border-white/25',
  text: 'text-white',
  subtext: 'text-white/80',
  input: 'border-white/40 bg-white/10 text-white placeholder-white/60 focus:border-white focus:ring-white/70',
  button: 'bg-white/90 text-[#0C1B3D] hover:bg-white focus:ring-white/70',
  error: 'bg-red-500/20 text-red-100',
  link: 'text-white underline-offset-4 hover:underline',
}

export const adminTheme = {
  background: '#0f172a',
  card: 'bg-white/5 border-white/10',
  text: 'text-slate-100',
  subtext: 'text-slate-400',
  input: 'border-slate-600 bg-slate-800 text-slate-100 placeholder-slate-400 focus:border-slate-400 focus:ring-slate-500',
  button: 'bg-slate-100 text-slate-900 hover:bg-white focus:ring-slate-400',
  error: 'bg-red-900/40 text-red-300',
  link: 'text-slate-400 underline-offset-4 hover:underline',
}

export type Theme = typeof userTheme
```

- [ ] **Step 2: Typecheck**

```bash
cd apps/web && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/srcs/themes.ts
git commit -m "feat: add userTheme and adminTheme design tokens"
```

---

## Task 3: Create Next.js login Route Handler (BFF proxy)

**Why a Route Handler?** `httpOnly` cookies can only be set by the server. The NestJS API is on port 3001; Next.js middleware runs on port 3000 and can only read cookies set on port 3000. This Route Handler runs server-side on port 3000, calls NestJS, gets the JWT, and sets the cookie on the correct domain.

**Files:**
- Create: `apps/web/app/api/auth/login/route.ts`

- [ ] **Step 1: Create the route handler**

Create `apps/web/app/api/auth/login/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  let apiRes: Response;
  try {
    apiRes = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { message: 'サーバーに接続できません' },
      { status: 503 },
    );
  }

  const data: unknown = await apiRes.json();

  if (!apiRes.ok) {
    return NextResponse.json(data, { status: apiRes.status });
  }

  const { access_token, user } = data as { access_token: string; user: { id: string; email: string; role: string } };

  const response = NextResponse.json({ user });

  response.cookies.set('access_token', access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour — matches NestJS JWT expiry
    path: '/',
  });

  return response;
}
```

- [ ] **Step 2: Typecheck**

```bash
cd apps/web && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Manual smoke test**

Start the API: `cd apps/api && pnpm dev`

In a separate terminal:
```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrongpassword"}' | jq
```

Expected: `{"message": "Invalid credentials"}` or similar 401 response from NestJS.

(A 503 means the API isn't running. A 401 with NestJS error text means the proxy is working.)

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/api/auth/login/route.ts
git commit -m "feat: add login BFF route handler with httpOnly cookie"
```

---

## Task 4: Create shared LoginForm component

**Files:**
- Create: `apps/web/srcs/components/login_form.tsx`

The JWT payload from NestJS is `{ sub: string, email: string, role: 'USER' | 'ADMIN' }`. The Route Handler returns `{ user: { id, email, role } }` to the browser (not the raw JWT). The component reads `user.role` from this response.

- [ ] **Step 1: Create the component**

Create `apps/web/srcs/components/login_form.tsx`:

```tsx
'use client';

import { Role } from '@j-address/shared';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import type { Theme } from '../themes';

type Props = {
  theme: Theme;
  variant: 'user' | 'admin';
};

export default function LoginForm({ theme, variant }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json() as { user?: { role: string }; message?: string };

      if (!res.ok) {
        throw new Error(data.message ?? 'ログインに失敗しました');
      }

      if (variant === 'user') {
        if (data.user?.role === Role.ADMIN) {
          throw new Error('管理者は /admin/login からログインしてください');
        }
        router.replace('/inbox');
      } else {
        if (data.user?.role === Role.USER) {
          throw new Error('このページは管理者専用です');
        }
        router.replace('/admin');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className={`rounded-md p-4 ${theme.error}`}>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="sr-only">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`appearance-none relative block w-full rounded-lg border px-3 py-2 focus:z-10 focus:outline-none focus:ring-2 sm:text-sm ${theme.input}`}
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="sr-only">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={`appearance-none relative block w-full rounded-lg border px-3 py-2 focus:z-10 focus:outline-none focus:ring-2 sm:text-sm ${theme.input}`}
            placeholder="パスワード(8文字以上)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`group relative flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${theme.button}`}
        >
          {isLoading ? 'ログイン中...' : 'ログイン'}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd apps/web && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/srcs/components/login_form.tsx
git commit -m "feat: add shared LoginForm component with theme and variant props"
```

---

## Task 5: Refactor user login page

**Files:**
- Modify: `apps/web/srcs/pages/login_page.tsx`

Replace the entire file contents. The form logic moves to `LoginForm`; this page handles layout and theme only.

- [ ] **Step 1: Replace login_page.tsx**

Replace the entire contents of `apps/web/srcs/pages/login_page.tsx` with:

```tsx
'use client';

import { userTheme } from '../themes';
import LoginForm from '../components/login_form';
import DecorativeBirds from '../components/decorative_birds';

export default function LoginPage() {
  return (
    <div
      className="relative flex min-h-screen items-start justify-center overflow-hidden px-4 pt-28 sm:pt-56"
      style={{ background: userTheme.background }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0">
        <svg
          className="h-60 w-full opacity-100"
          viewBox="0 0 1440 290"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,160 C180,120 360,120 540,150 C720,180 900,230 1080,210 C1260,190 1350,150 1440,120 L1440,0 L0,0 Z"
            fill="#e6eaef"
          />
        </svg>
      </div>
      <DecorativeBirds />
      <div
        className={`relative z-10 w-full max-w-md space-y-8 rounded-3xl border p-8 shadow-2xl backdrop-blur ${userTheme.card}`}
      >
        <div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${userTheme.text}`}>
            J-addressにログイン
          </h2>
          <p className={`mt-2 text-center text-sm ${userTheme.subtext}`}>
            日本の郵便物転送サービス
          </p>
        </div>
        <LoginForm theme={userTheme} variant="user" />
        <div className="text-center text-sm">
          <a href="/signup" className={`font-medium ${userTheme.link}`}>
            アカウントをお持ちでない方は新規登録
          </a>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd apps/web && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Manual smoke test**

```bash
pnpm dev
```

Navigate to `http://localhost:3000/login`. The sky gradient login page should appear. Verify the form renders correctly. Try logging in with a test user — should redirect to `/inbox`.

- [ ] **Step 4: Commit**

```bash
git add apps/web/srcs/pages/login_page.tsx
git commit -m "refactor: user login page uses LoginForm with userTheme"
```

---

## Task 6: Create admin login page

**Files:**
- Create: `apps/web/srcs/pages/admin_login_page.tsx`

- [ ] **Step 1: Create admin_login_page.tsx**

Create `apps/web/srcs/pages/admin_login_page.tsx`:

```tsx
'use client';

import { adminTheme } from '../themes';
import LoginForm from '../components/login_form';

export default function AdminLoginPage() {
  return (
    <div
      className="relative flex min-h-screen items-start justify-center overflow-hidden px-4 pt-28 sm:pt-56"
      style={{ background: adminTheme.background }}
    >
      <div
        className={`relative z-10 w-full max-w-md space-y-8 rounded-3xl border p-8 shadow-2xl ${adminTheme.card}`}
      >
        <div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${adminTheme.text}`}>
            管理者ログイン
          </h2>
          <p className={`mt-2 text-center text-sm ${adminTheme.subtext}`}>
            J-address 管理ポータル
          </p>
        </div>
        <LoginForm theme={adminTheme} variant="admin" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd apps/web && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/srcs/pages/admin_login_page.tsx
git commit -m "feat: add admin login page with dark navy theme"
```

---

## Task 7: Create admin/login route shell

**Files:**
- Create: `apps/web/app/admin/login/page.tsx`

- [ ] **Step 1: Create the route shell**

Create `apps/web/app/admin/login/page.tsx`:

```tsx
import AdminLoginPage from '@/srcs/pages/admin_login_page';

export default function AdminLoginRoute() {
  return <AdminLoginPage />;
}
```

- [ ] **Step 2: Typecheck**

```bash
cd apps/web && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Manual smoke test**

Navigate to `http://localhost:3000/admin/login`. The dark navy admin login page should appear. Try logging in with an admin account — should redirect to `/admin`.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/admin/login/page.tsx
git commit -m "feat: add /admin/login route"
```

---

## Task 8: Create Next.js middleware

**Files:**
- Create: `apps/web/middleware.ts`

The middleware runs on the Next.js edge runtime. It uses `jose` (edge-compatible) to verify the JWT from the `access_token` cookie. The JWT payload shape from NestJS is `{ sub: string, email: string, role: 'USER' | 'ADMIN', iat: number, exp: number }`.

**Route rules:**
| Path | Condition | Action |
|---|---|---|
| `/inbox`, `/inbox/*` | No valid cookie or role ≠ USER | Redirect → `/login` |
| `/admin/login` | Valid cookie with role ADMIN | Redirect → `/admin` |
| `/admin`, `/admin/*` | No valid cookie or role ≠ ADMIN | Redirect → `/admin/login` |
| `/login` | Valid cookie with role USER | Redirect → `/inbox` |

- [ ] **Step 1: Create middleware.ts**

Create `apps/web/middleware.ts`:

```ts
import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'your_jwt_secret_key',
);

type JwtPayload = {
  sub: string;
  email: string;
  role: 'USER' | 'ADMIN';
};

async function getPayload(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('access_token')?.value;
  const payload = token ? await getPayload(token) : null;

  // /inbox/* — require authenticated USER
  if (pathname.startsWith('/inbox')) {
    if (!payload || payload.role !== 'USER') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  // /admin/login — redirect ADMIN away if already authenticated
  if (pathname === '/admin/login') {
    if (payload?.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.next();
  }

  // /admin/* — require authenticated ADMIN
  if (pathname.startsWith('/admin')) {
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    return NextResponse.next();
  }

  // /login — redirect USER away if already authenticated
  if (pathname === '/login') {
    if (payload?.role === 'USER') {
      return NextResponse.redirect(new URL('/inbox', req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/inbox/:path*', '/admin/:path*', '/login'],
};
```

- [ ] **Step 2: Typecheck**

```bash
cd apps/web && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Manual smoke test — unauthenticated access**

With the dev server running and no `access_token` cookie set:

1. Navigate to `http://localhost:3000/inbox` → should redirect to `/login`
2. Navigate to `http://localhost:3000/admin` → should redirect to `/admin/login`
3. Navigate to `http://localhost:3000/admin/login` → should show admin login page (no redirect)

- [ ] **Step 4: Manual smoke test — authenticated access**

1. Log in as a regular user at `/login` → should land on `/inbox`
2. Now try navigating to `/admin` → should redirect to `/admin/login`
3. Now try navigating to `/login` → should redirect back to `/inbox`

- [ ] **Step 5: Commit**

```bash
git add apps/web/middleware.ts
git commit -m "feat: add Next.js middleware for role-based route protection"
```

---

## Done

All tasks complete. The feature delivers:
- `/login` (user-only) and `/admin/login` (admin-only) as separate routes
- Shared `LoginForm` component themed per role
- `httpOnly` cookie JWT storage via BFF Route Handler
- Server-side route protection via Next.js edge middleware
