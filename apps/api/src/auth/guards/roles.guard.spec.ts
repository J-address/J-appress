import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from '../../../generated/prisma';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    const createMockExecutionContext = (user?: unknown): ExecutionContext => {
      return {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user,
          }),
        }),
      } as unknown as ExecutionContext;
    };

    it('should return true if no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const context = createMockExecutionContext();
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return true if user has the required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

      const mockUser = {
        userId: 'user-123',
        email: 'admin@example.com',
        role: Role.ADMIN,
      };

      const context = createMockExecutionContext(mockUser);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException if user does not have required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

      const mockUser = {
        userId: 'user-123',
        email: 'user@example.com',
        role: Role.USER,
      };

      const context = createMockExecutionContext(mockUser);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'You do not have permission to access this resource',
      );
    });

    it('should throw ForbiddenException if user is not authenticated', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

      const context = createMockExecutionContext(undefined);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user has no role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

      const mockUser = {
        userId: 'user-123',
        email: 'user@example.com',
        role: undefined,
      };

      const context = createMockExecutionContext(mockUser);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow access if user has one of multiple required roles', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Role.ADMIN, Role.USER]);

      const mockUser = {
        userId: 'user-123',
        email: 'user@example.com',
        role: Role.USER,
      };

      const context = createMockExecutionContext(mockUser);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });
});
