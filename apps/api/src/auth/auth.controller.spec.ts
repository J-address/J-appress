import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { Role } from '../../generated/prisma';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

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
      const loginDto = { email: 'test@example.com', password: 'password123', loginType: 'user' as const };
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

    it('should propagate ForbiddenException when service rejects USER attempting admin login', async () => {
      const loginDto = {
        email: 'user@example.com',
        password: 'password123',
        loginType: 'admin' as const,
      };
      mockAuthService.login.mockRejectedValue(new ForbiddenException('このページは管理者専用です'));

      await expect(controller.login(loginDto, mockRes)).rejects.toThrow(ForbiddenException);
      expect(mockRes.cookie).not.toHaveBeenCalled();
    });

    it('should propagate ForbiddenException when service rejects ADMIN attempting user login', async () => {
      const loginDto = {
        email: 'admin@example.com',
        password: 'password123',
        loginType: 'user' as const,
      };
      mockAuthService.login.mockRejectedValue(
        new ForbiddenException('管理者は /admin/login からログインしてください'),
      );

      await expect(controller.login(loginDto, mockRes)).rejects.toThrow(ForbiddenException);
      expect(mockRes.cookie).not.toHaveBeenCalled();
    });

    it('should allow USER to login with loginType: user', async () => {
      const loginDto = { email: 'user@example.com', password: 'password123', loginType: 'user' as const };
      mockAuthService.login.mockResolvedValue({
        access_token: 'jwt-token',
        user: { id: 'user-123', email: 'user@example.com', role: Role.USER },
      });

      const result = await controller.login(loginDto, mockRes);
      expect(mockRes.cookie).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
    });

    it('should allow USER to login with loginType: user', async () => {
      const loginDto = {
        email: 'user@example.com',
        password: 'password123',
        loginType: 'user' as const,
      };
      mockAuthService.login.mockResolvedValue({
        access_token: 'jwt-token',
        user: { id: 'user-123', email: 'user@example.com', role: Role.USER },
      });

      const result = await controller.login(loginDto, mockRes);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'access_token',
        'jwt-token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result).toHaveProperty('user');
    });

    it('should allow ADMIN to login with loginType: admin', async () => {
      const loginDto = {
        email: 'admin@example.com',
        password: 'password123',
        loginType: 'admin' as const,
      };
      mockAuthService.login.mockResolvedValue({
        access_token: 'jwt-token',
        user: { id: 'admin-123', email: 'admin@example.com', role: Role.ADMIN },
      });

      const result = await controller.login(loginDto, mockRes);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'access_token',
        'jwt-token',
        expect.objectContaining({ httpOnly: true }),
      );
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
