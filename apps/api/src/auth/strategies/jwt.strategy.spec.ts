import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../../generated/prisma';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  } as unknown as PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: PrismaService, // Provide the mock PrismaService
          useValue: mockPrismaService, // Use the mock PrismaService
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const mockPayload = {
      sub: 'user-123',
      email: 'test@example.com',
      role: Role.USER,
    };

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return user data when user exists', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await strategy.validate(mockPayload);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockPayload.sub },
      });
      expect(result).toEqual({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        'User not found',
      );
    });

    it('should handle admin users correctly', async () => {
      const adminPayload = {
        sub: 'admin-456',
        email: 'admin@example.com',
        role: Role.ADMIN,
      };

      const adminUser = {
        id: 'admin-456',
        email: 'admin@example.com',
        password: 'hashedPassword',
        role: Role.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(adminUser);

      const result = await strategy.validate(adminPayload);

      expect(result).toEqual({
        userId: adminUser.id,
        email: adminUser.email,
        role: Role.ADMIN,
      });
    });
  });
});
