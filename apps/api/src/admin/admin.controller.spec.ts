import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import supertest from 'supertest';
import { Role } from '../../generated/prisma';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthUser } from '../auth/types/auth.types';
import { AdminController } from './admin.controller';

const buildAppWithUser = async (user: AuthUser | null): Promise<INestApplication> => {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [AdminController],
    providers: [RolesGuard, Reflector],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue({
      canActivate: (ctx: ExecutionContext) => {
        if (!user) return false;
        ctx.switchToHttp().getRequest().user = user;
        return true;
      },
    })
    .compile();

  const app = module.createNestApplication();
  await app.init();
  return app;
};

describe('AdminController', () => {
  describe('GET /admin/dashboard', () => {
    let app: INestApplication;

    afterEach(async () => {
      await app.close();
    });

    it('should return 200 with dashboard data when an ADMIN accesses the dashboard', async () => {
      app = await buildAppWithUser({
        userId: 'admin-123',
        email: 'admin@example.com',
        role: Role.ADMIN,
      });

      await supertest(app.getHttpServer())
        .get('/admin/dashboard')
        .expect(200)
        .expect({
          message: 'Welcome to the admin dashboard',
          user: { id: 'admin-123', email: 'admin@example.com', role: Role.ADMIN },
        });
    });

    it('should return 403 Forbidden when a USER accesses the dashboard', async () => {
      app = await buildAppWithUser({
        userId: 'user-123',
        email: 'user@example.com',
        role: Role.USER,
      });

      await supertest(app.getHttpServer()).get('/admin/dashboard').expect(403);
    });

    it('should return 403 Forbidden when no user is authenticated', async () => {
      app = await buildAppWithUser(null);

      await supertest(app.getHttpServer()).get('/admin/dashboard').expect(403);
    });
  });
});
