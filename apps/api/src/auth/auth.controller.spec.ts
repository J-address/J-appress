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

  });

  describe('getProfile', () => {
    it('should return the authenticated user', () => {
      const mockUser = { userId: 'user-123', email: 'test@example.com', role: Role.USER };
      const result = controller.getProfile(mockUser);
      expect(result).toEqual(mockUser);
    });
  });
});
