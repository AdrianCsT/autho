import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtTokenService } from '../jwt-token.service';
import { PrismaService } from '../../database/prisma.service';

describe('JwtTokenService', () => {
  let service: JwtTokenService;
  let jwtService: JwtService;
  let prisma: PrismaService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        JWT_ACCESS_SECRET: 'test-access-secret',
        JWT_ACCESS_EXPIRATION: '15m',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_REFRESH_EXPIRATION: '7d',
      };
      return config[key];
    }),
  };

  const mockPrismaService = {
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtTokenService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<JwtTokenService>(JwtTokenService);
    jwtService = module.get<JwtService>(JwtService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate an access token', async () => {
      const payload = { sub: '123', username: 'testuser', roles: ['user'] };
      const token = 'access-token';

      mockJwtService.sign.mockReturnValue(token);

      const result = await service.generateAccessToken(payload);

      expect(result).toBe(token);
      expect(mockJwtService.sign).toHaveBeenCalledWith(payload, {
        secret: 'test-access-secret',
        expiresIn: '15m',
      });
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify and return payload', async () => {
      const token = 'valid-token';
      const payload = { sub: '123', username: 'testuser', roles: ['user'] };

      mockJwtService.verify.mockReturnValue(payload);

      const result = await service.verifyAccessToken(token);

      expect(result).toEqual(payload);
      expect(mockJwtService.verify).toHaveBeenCalledWith(token, {
        secret: 'test-access-secret',
      });
    });

    it('should throw error for invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.verifyAccessToken('invalid')).rejects.toThrow('Invalid access token');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token', async () => {
      const userId = '123';
      const token = 'refresh-token';

      mockJwtService.sign.mockReturnValue(token);

      const result = await service.generateRefreshToken(userId);

      expect(result).toBe(token);
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { sub: userId },
        {
          secret: 'test-refresh-secret',
          expiresIn: '7d',
        }
      );
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify refresh token and return full payload', async () => {
      const token = 'valid-refresh-token';
      const mockUser = {
        id: '123',
        username: 'testuser',
        role: { id: 'role-1', name: 'user' },
      };

      mockJwtService.verify.mockReturnValue({ sub: '123' });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.verifyRefreshToken(token);

      expect(result).toEqual({
        sub: '123',
        username: 'testuser',
        roles: ['user'],
      });
    });

    it('should throw error when user not found', async () => {
      mockJwtService.verify.mockReturnValue({ sub: '123' });
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.verifyRefreshToken('token')).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('saveRefreshToken', () => {
    it('should save refresh token to database', async () => {
      const userId = '123';
      const token = 'refresh-token';
      const expiresAt = new Date();

      mockPrismaService.refreshToken.create.mockResolvedValue({
        id: 'token-id',
        tokenHash: token,
        userId,
        expiresAt,
        revoked: false,
        createdAt: new Date(),
      });

      const result = await service.saveRefreshToken(userId, token, expiresAt);

      expect(result.token).toBe(token);
      expect(result.userId).toBe(userId);
      expect(mockPrismaService.refreshToken.create).toHaveBeenCalledWith({
        data: {
          tokenHash: token,
          userId,
          expiresAt,
        },
      });
    });
  });

  describe('findRefreshToken', () => {
    it('should find and return refresh token', async () => {
      const token = 'refresh-token';
      const mockToken = {
        id: 'token-id',
        tokenHash: token,
        userId: '123',
        expiresAt: new Date(),
        revoked: false,
        createdAt: new Date(),
      };

      mockPrismaService.refreshToken.findFirst.mockResolvedValue(mockToken);

      const result = await service.findRefreshToken(token);

      expect(result?.token).toBe(token);
    });

    it('should return null when token not found', async () => {
      mockPrismaService.refreshToken.findFirst.mockResolvedValue(null);

      const result = await service.findRefreshToken('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('revokeRefreshToken', () => {
    it('should delete refresh token', async () => {
      const token = 'refresh-token';

      await service.revokeRefreshToken(token);

      expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { tokenHash: token },
        data: { revoked: true },
      });
    });
  });

  describe('revokeAllUserRefreshTokens', () => {
    it('should delete all user refresh tokens', async () => {
      const userId = '123';

      await service.revokeAllUserRefreshTokens(userId);

      expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId },
        data: { revoked: true },
      });
    });
  });
});
