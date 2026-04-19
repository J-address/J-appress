# Separate Login Routes Design

**Date:** 2026-04-19
**Status:** Approved

## Overview

Split the single `/login` page into two distinct routes — `/login` for regular users and `/admin/login` for admins — with separate visual themes, a shared form component, and Next.js middleware for server-side route protection.

---

## Goals

- Clear separation between user-facing and admin-facing login surfaces
- Visually distinct themes per role, easy to restyle later
- Server-side route protection via Next.js middleware (not client-side only)
- Secure JWT storage via `httpOnly` cookie instead of `localStorage`

---

## Section 1: Theme System

A `srcs/themes.ts` file exports two typed theme objects. All styled components read from these objects — no hardcoded Tailwind color classes in login UI.

```ts
// srcs/themes.ts
export const userTheme = {
  background: 'linear-gradient(180deg, #d8dadd 3%, #c0dfff 16%, #6aa2f0 36%, #0155c3 90%)',
  card: 'bg-white/10 border-white/25',
  text: 'text-white',
  input: 'border-white/40 bg-white/10 text-white placeholder-white/60',
  button: 'bg-white/90 text-[#0C1B3D] hover:bg-white',
  error: 'bg-red-500/20 text-red-100',
  link: 'text-white hover:underline',
}

export const adminTheme = {
  background: '#0f172a', // dark navy — change this one value to restyle
  card: 'bg-white/5 border-white/10',
  text: 'text-slate-100',
  input: 'border-slate-600 bg-slate-800 text-slate-100 placeholder-slate-400',
  button: 'bg-slate-100 text-slate-900 hover:bg-white',
  error: 'bg-red-900/40 text-red-300',
  link: 'text-slate-300 hover:underline',
}

export type Theme = typeof userTheme
```

---

## Section 2: Component Architecture

### Shared component

`srcs/components/login_form.tsx` — accepts `theme` and `variant` props.

```
Props:
  theme: Theme
  variant: 'user' | 'admin'
```

Responsibilities:
- Renders email + password inputs styled from `theme`
- Calls `POST /auth/login`
- On success: sets JWT as `httpOnly` cookie, then redirects
  - `user` variant: redirects to `/inbox`; shows error if response role is ADMIN
  - `admin` variant: redirects to `/admin`; shows error if response role is USER
- On failure: shows error message

### Pages

| File | Route | Theme |
|---|---|---|
| `srcs/pages/login_page.tsx` | `/login` | `userTheme` |
| `srcs/pages/admin_login_page.tsx` | `/admin/login` | `adminTheme` |

### Route shells

| File | Delegates to |
|---|---|
| `app/login/page.tsx` | `login_page.tsx` (unchanged) |
| `app/admin/login/page.tsx` | `admin_login_page.tsx` (new) |
| `app/admin/page.tsx` | `admin_page.tsx` (unchanged) |

---

## Section 3: JWT Storage Change

**Before:** `localStorage.setItem('access_token', token)`

**After:** Server sets `httpOnly` cookie on login response. The API (`POST /auth/login`) must set a `Set-Cookie` header with:
- `httpOnly: true` — not accessible to JavaScript
- `Secure: true` — HTTPS only (dev: false)
- `SameSite: lax` — CSRF protection

The frontend no longer stores or reads the token directly.

---

## Section 4: Middleware

`apps/web/middleware.ts` — runs on Next.js edge before any page renders.

### Rules

| Path pattern | Condition | Action |
|---|---|---|
| `/inbox`, `/inbox/*` | No valid JWT cookie or role ≠ USER | Redirect → `/login` |
| `/admin`, `/admin/*` (except `/admin/login`) | No valid JWT cookie or role ≠ ADMIN | Redirect → `/admin/login` |
| `/login` | Valid JWT with role USER | Redirect → `/inbox` |
| `/admin/login` | Valid JWT with role ADMIN | Redirect → `/admin` |

JWT is decoded client-side in middleware using `jose` (edge-compatible JWT library — no Node.js crypto APIs).

### Matcher config

```ts
export const config = {
  matcher: ['/inbox/:path*', '/admin/:path*', '/login', '/admin/login'],
}
```

---

## Files to Create / Modify

| Action | File |
|---|---|
| Create | `apps/web/srcs/themes.ts` |
| Create | `apps/web/srcs/components/login_form.tsx` |
| Create | `apps/web/srcs/pages/admin_login_page.tsx` |
| Create | `apps/web/app/admin/login/page.tsx` |
| Create | `apps/web/middleware.ts` |
| Modify | `apps/web/srcs/pages/login_page.tsx` |
| Modify | `apps/api/src/auth/auth.controller.ts` (add Set-Cookie header) |

---

## Out of Scope

- Refresh token rotation
- Remember me / persistent sessions
- Google OAuth
- Password reset flow
