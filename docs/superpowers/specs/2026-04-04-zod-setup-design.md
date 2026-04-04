---
title: Zod 4 Setup — Replace class-validator
date: 2026-04-04
status: approved
---

## Overview

Replace `class-validator` + `class-transformer` with Zod 4 for validation across the monorepo. Schemas defined once in `packages/shared`, reused by both the NestJS API and (in future) the Next.js frontend.

## Packages

| Package | Location | Action |
|---|---|---|
| `zod` | `packages/shared` | Add |
| `nestjs-zod` | `apps/api` | Add |
| `class-validator` | `apps/api` | Remove |
| `class-transformer` | `apps/api` | Remove |

## Schema Location

All schemas live in `packages/shared/src/schemas/` so the frontend can import them later.

```
packages/shared/src/
  schemas/
    auth.schema.ts      ← registerSchema, loginSchema
  types/index.ts        ← existing enums/interfaces (unchanged)
  index.ts              ← export schemas + types
```

## API Wiring

- `main.ts`: replace `ValidationPipe` with `ZodValidationPipe` from `nestjs-zod` (global)
- DTOs become thin wrappers using `createZodDto()`:
  ```ts
  export class RegisterDto extends createZodDto(registerSchema) {}
  ```
- Delete decorator-based DTO files

## What Does Not Change

- Controllers, services, guards, Prisma — untouched
- All 28 existing tests must pass after migration

## Success Criteria

- `class-validator` and `class-transformer` removed from `apps/api`
- Schemas exported from `packages/shared`
- All 28 tests passing
- `pnpm typecheck` passes
