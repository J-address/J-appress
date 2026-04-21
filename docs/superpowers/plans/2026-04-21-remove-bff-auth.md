# Remove BFF Auth — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove Next.js BFF Route Handlers for auth and have the browser call NestJS directly, with NestJS setting the `httpOnly` cookie itself.

**Architecture:** Browser calls `http://localhost:3001/auth/login` and `/auth/signup` directly with `credentials: 'include'`. NestJS sets the `httpOnly` cookie in the response. The Next.js Route Handlers (`app/api/auth/login/route.ts`, `app/api/auth/signup/route.ts`) are deleted. Middleware stays unchanged — it still reads the `access_token` cookie.

**Tech Stack:** NestJS 11, Next.js 16, Zod 4, `@nestjs/common` Response object, `credentials: 'include'` fetch option.

---

## File Map

| File | Change |
|---|---|
| `packages/shared/src/schemas/auth.schema.ts` | Add `loginType` to `loginSchema`; update `authResponseSchema` to remove `access_token` |
| `apps/api/src/auth/auth.controller.ts` | Add `@Res`, set httpOnly cookie, check `loginType` vs role, return `{ user }` only |
| `apps/api/src/auth/auth.controller.spec.ts` | Update tests to pass mock `Response`, test role check, test cookie set |
| `apps/web/srcs/components/login_form.tsx` | Call NestJS directly, add `credentials: 'include'`, rename `variant` → `loginType` in body |
| `apps/web/srcs/pages/signup_page.tsx` | Call NestJS directly, add `credentials: 'include'` |
| `apps/web/app/api/auth/login/route.ts` | **Delete** |
| `apps/web/app/api/auth/signup/route.ts` | **Delete** |

---

## Task 1: Update shared auth schema

**Files:**
- Modify: `packages/shared/src/schemas/auth.schema.ts`

- [ ] **Step 1: Update the schema**

Replace the entire file content:

```ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
  loginType: z.enum(['user', 'admin']).optional(),
});

export const authResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    role: z.enum(['USER', 'ADMIN']),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
```

- [ ] **Step 2: Run shared schema tests**

```bash
cd /Users/otaniyuhi/Dropbox/J-app/packages/shared && pnpm test
```

Expected: all pass (existing tests only cover `registerSchema` and `loginSchema` base fields — `loginType` is optional so no breakage).

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/schemas/auth.schema.ts
git commit -m "feat: add loginType to loginSchema, remove access_token from authResponseSchema"
```

---

## Task 2: Update NestJS auth controller

**Files:**
- Modify: `apps/api/src/auth/auth.controller.ts`
- Modify: `apps/api/src/auth/auth.controller.spec.ts`

- [ ] **Step 1: Write failing tests**

Replace `apps/api/src/auth/auth.controller.spec.ts`:

```ts
import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { Role } from '../../generated/prisma';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
  };

  const mockRes = {
    cookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should set httpOnly cookie and return only user', async () => {
      const signupDto = { email: 'test@example.com', password: 'password123' };
      mockAuthService.signup.mockResolvedValue({
        access_token: 'jwt-token',
        user: { id: 'user-123', email: 'test@example.com', role: Role.USER },
      });

      const result = await controller.signup(signupDto, mockRes);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'access_token',
        'jwt-token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result).toEqual({
        user: { id: 'user-123', email: 'test@example.com', role: Role.USER },
      });
      expect(result).not.toHaveProperty('access_token');
    });
  });

  describe('login', () => {
    it('should set httpOnly cookie and return only user', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      mockAuthService.login.mockResolvedValue({
        access_token: 'jwt-token',
        user: { id: 'user-123', email: 'test@example.com', role: Role.USER },
      });

      const result = await controller.login(loginDto, mockRes);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'access_token',
        'jwt-token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result).toEqual({
        user: { id: 'user-123', email: 'test@example.com', role: Role.USER },
      });
    });

    it('should throw ForbiddenException when USER tries to login via admin', async () => {
      const loginDto = { email: 'user@example.com', password: 'password123', loginType: 'admin' as const };
      mockAuthService.login.mockResolvedValue({
        access_token: 'jwt-token',
        user: { id: 'user-123', email: 'user@example.com', role: Role.USER },
      });

      await expect(controller.login(loginDto, mockRes)).rejects.toThrow(ForbiddenException);
      expect(mockRes.cookie).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when ADMIN tries to login via user', async () => {
      const loginDto = { email: 'admin@example.com', password: 'password123', loginType: 'user' as const };
      mockAuthService.login.mockResolvedValue({
        access_token: 'jwt-token',
        user: { id: 'admin-123', email: 'admin@example.com', role: Role.ADMIN },
      });

      await expect(controller.login(loginDto, mockRes)).rejects.toThrow(ForbiddenException);
      expect(mockRes.cookie).not.toHaveBeenCalled();
    });

    it('should allow USER to login without loginType', async () => {
      const loginDto = { email: 'user@example.com', password: 'password123' };
      mockAuthService.login.mockResolvedValue({
        access_token: 'jwt-token',
        user: { id: 'user-123', email: 'user@example.com', role: Role.USER },
      });

      const result = await controller.login(loginDto, mockRes);
      expect(mockRes.cookie).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
    });
  });

  describe('getProfile', () => {
    it('should return the authenticated user', () => {
      const mockUser = { userId: 'user-123', email: 'test@example.com', role: Role.USER };
      const result = controller.getProfile(mockUser);
      expect(result).toEqual(mockUser);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/otaniyuhi/Dropbox/J-app/apps/api && pnpm test auth.controller
```

Expected: FAIL — `controller.signup` and `controller.login` don't accept `mockRes` yet, cookie assertions fail.

- [ ] **Step 3: Update the controller**

Replace `apps/api/src/auth/auth.controller.ts`:

```ts
import { Body, Controller, ForbiddenException, Get, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthResponse, UserResponse } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthUser } from './types/auth.types';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 1000, // 1 hour in ms (express uses ms, not seconds)
  path: '/',
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, type: AuthResponse })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @Post('signup')
  async signup(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { access_token, user } = await this.authService.signup(dto);
    res.cookie('access_token', access_token, COOKIE_OPTIONS);
    return { user };
  }

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, type: AuthResponse })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Wrong login portal' })
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { access_token, user } = await this.authService.login(dto);

    if (dto.loginType === 'admin' && user.role !== 'ADMIN') {
      throw new ForbiddenException('このページは管理者専用です');
    }
    if (dto.loginType === 'user' && user.role !== 'USER') {
      throw new ForbiddenException('管理者は /admin/login からログインしてください');
    }

    res.cookie('access_token', access_token, COOKIE_OPTIONS);
    return { user };
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserResponse })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/otaniyuhi/Dropbox/J-app/apps/api && pnpm test auth.controller
```

Expected: all tests PASS.

- [ ] **Step 5: Run all API tests to check for regressions**

```bash
cd /Users/otaniyuhi/Dropbox/J-app/apps/api && pnpm test
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/auth/auth.controller.ts apps/api/src/auth/auth.controller.spec.ts
git commit -m "feat: NestJS sets httpOnly cookie directly, adds loginType role check"
```

---

## Task 3: Update login form to call NestJS directly

**Files:**
- Modify: `apps/web/srcs/components/login_form.tsx`

- [ ] **Step 1: Update the fetch call**

In `apps/web/srcs/components/login_form.tsx`, replace the `handleSubmit` function body:

```ts
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  try {
    const res = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, loginType: variant }),
    });

    const data = await res.json() as { message?: string };

    if (!res.ok) {
      throw new Error(data.message ?? 'ログインに失敗しました');
    }

    if (variant === 'user') {
      router.replace('/inbox');
    } else {
      router.replace('/admin');
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
  } finally {
    setIsLoading(false);
  }
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/otaniyuhi/Dropbox/J-app && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/srcs/components/login_form.tsx
git commit -m "feat: login form calls NestJS directly with credentials: include"
```

---

## Task 4: Update signup page to call NestJS directly

**Files:**
- Modify: `apps/web/srcs/pages/signup_page.tsx`

- [ ] **Step 1: Update the fetch call**

In `apps/web/srcs/pages/signup_page.tsx`, replace the fetch block inside `handleSubmit`:

```ts
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const response = await fetch(`${apiUrl}/auth/signup`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({ email, password }),
});
```

Also remove the comment on the redirect line:

```ts
window.location.href = '/inbox';
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/otaniyuhi/Dropbox/J-app && pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/srcs/pages/signup_page.tsx
git commit -m "feat: signup page calls NestJS directly with credentials: include"
```

---

## Task 5: Delete BFF Route Handlers

**Files:**
- Delete: `apps/web/app/api/auth/login/route.ts`
- Delete: `apps/web/app/api/auth/signup/route.ts`

- [ ] **Step 1: Delete the Route Handler files**

```bash
rm /Users/otaniyuhi/Dropbox/J-app/apps/web/app/api/auth/login/route.ts
rm /Users/otaniyuhi/Dropbox/J-app/apps/web/app/api/auth/signup/route.ts
```

- [ ] **Step 2: Remove now-empty directories**

```bash
rmdir /Users/otaniyuhi/Dropbox/J-app/apps/web/app/api/auth/login
rmdir /Users/otaniyuhi/Dropbox/J-app/apps/web/app/api/auth/signup
rmdir /Users/otaniyuhi/Dropbox/J-app/apps/web/app/api/auth
rmdir /Users/otaniyuhi/Dropbox/J-app/apps/web/app/api
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/otaniyuhi/Dropbox/J-app && pnpm typecheck
```

Expected: no errors. If `authResponseSchema` import errors appear in deleted files — those files are gone, so no issue. If shared package still exports it, that's fine — it will be used by the browser later.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: delete BFF auth Route Handlers"
```

---

## Task 6: Manual end-to-end verification

- [ ] **Step 1: Start both servers**

```bash
cd /Users/otaniyuhi/Dropbox/J-app && pnpm dev
```

- [ ] **Step 2: Test signup flow**

1. Open `http://localhost:3000/signup`
2. Fill in email and password, submit
3. Expected: redirected to `/inbox`
4. Open browser DevTools → Application → Cookies → `localhost`
5. Expected: `access_token` cookie present with `HttpOnly` flag checked

- [ ] **Step 3: Test user login flow**

1. Open `http://localhost:3000/login`
2. Login with a USER account
3. Expected: redirected to `/inbox`
4. Expected: `access_token` cookie present with `HttpOnly` flag

- [ ] **Step 4: Test admin login flow**

1. Open `http://localhost:3000/admin/login`
2. Login with an ADMIN account
3. Expected: redirected to `/admin`

- [ ] **Step 5: Test wrong role rejection**

1. Open `http://localhost:3000/login`
2. Try to login with an ADMIN account
3. Expected: error message "管理者は /admin/login からログインしてください"

- [ ] **Step 6: Test middleware still works**

1. Clear cookies
2. Try to access `http://localhost:3000/inbox` directly
3. Expected: redirected to `/login`
