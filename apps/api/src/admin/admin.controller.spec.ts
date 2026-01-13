import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { Role } from '../../generated/prisma';

describe('AdminController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDashboard', () => {
    it('should return admin dashboard data', () => {
      const mockUser = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: Role.ADMIN,
      };

      const result = controller.getDashboard(mockUser);

      expect(result).toEqual({
        message: 'Welcome to the admin dashboard',
        user: {
          id: mockUser.userId,
          email: mockUser.email,
          role: mockUser.role,
        },
        stats: {
          totalUsers: 0,
          totalInboxItems: 0,
        },
      });
    });

    it('should include correct user information', () => {
      const mockUser = {
        userId: 'test-admin-456',
        email: 'test@admin.com',
        role: Role.ADMIN,
      };

      const result = controller.getDashboard(mockUser);

      expect(result.user).toEqual({
        id: 'test-admin-456',
        email: 'test@admin.com',
        role: Role.ADMIN,
      });
    });
  });
});
