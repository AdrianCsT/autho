import { RefreshTokenUseCase } from '../refresh-token.use-case';
import { RefreshTokenCommand } from '../refresh-token.use-case.dto';
import { ITokenService } from '../../../../domain/interfaces/services/token-service.interface';
import { IUserRepository } from '../../../../domain/interfaces/repositories/user.repository.interface';
import { UnauthorizedException } from '@nestjs/common';
import { UserEntity, UserStatus } from '../../../../domain/entities/user.entity';
import { Email } from '../../../../domain/value-objects/email.vo';

describe('RefreshTokenUseCase', () => {
  let refreshTokenUseCase: RefreshTokenUseCase;
  let mockTokenService: jest.Mocked<ITokenService>;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  const mockUser = UserEntity.reconstitute({
    id: 'user-123',
    username: 'testuser',
    email: Email.create('test@example.com'),
    passwordHash: 'hashedPassword',
    roles: ['user'],
    status: UserStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockRefreshTokenData = {
    id: 'token-id',
    userId: 'user-123',
    token: 'valid-refresh-token',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
  };

  beforeEach(() => {
    mockTokenService = {
      verifyRefreshToken: jest.fn(),
      isTokenRevoked: jest.fn(),
      findRefreshToken: jest.fn(),
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      saveRefreshToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
    } as any;

    mockUserRepository = {
      findById: jest.fn(),
    } as any;

    refreshTokenUseCase = new RefreshTokenUseCase(mockTokenService, mockUserRepository);
  });

  describe('successful token refresh', () => {
    it('should return new tokens when refresh token is valid', async () => {
      const command = new RefreshTokenCommand('valid-refresh-token');

      mockTokenService.findRefreshToken.mockResolvedValue(mockRefreshTokenData);
      mockTokenService.verifyRefreshToken.mockResolvedValue({ 
        sub: 'user-123', 
        username: 'testuser', 
        roles: ['user'] 
      });
      mockTokenService.isTokenRevoked.mockResolvedValue(false);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockTokenService.generateAccessToken.mockResolvedValue('new-access-token');
      mockTokenService.generateRefreshToken.mockResolvedValue('new-refresh-token');

      const result = await refreshTokenUseCase.execute(command);

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
    });

    it('should revoke old refresh token', async () => {
      const command = new RefreshTokenCommand('valid-refresh-token');

      mockTokenService.findRefreshToken.mockResolvedValue(mockRefreshTokenData);
      mockTokenService.verifyRefreshToken.mockResolvedValue({ 
        sub: 'user-123', 
        username: 'testuser', 
        roles: ['user'] 
      });
      mockTokenService.isTokenRevoked.mockResolvedValue(false);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockTokenService.generateAccessToken.mockResolvedValue('new-access-token');
      mockTokenService.generateRefreshToken.mockResolvedValue('new-refresh-token');

      await refreshTokenUseCase.execute(command);

      expect(mockTokenService.revokeRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
    });

    it('should generate tokens with correct payload', async () => {
      const command = new RefreshTokenCommand('valid-refresh-token');

      mockTokenService.findRefreshToken.mockResolvedValue(mockRefreshTokenData);
      mockTokenService.verifyRefreshToken.mockResolvedValue({ 
        sub: 'user-123', 
        username: 'testuser', 
        roles: ['user'] 
      });
      mockTokenService.isTokenRevoked.mockResolvedValue(false);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockTokenService.generateAccessToken.mockResolvedValue('new-access-token');
      mockTokenService.generateRefreshToken.mockResolvedValue('new-refresh-token');

      await refreshTokenUseCase.execute(command);

      expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith({
        sub: 'user-123',
        username: 'testuser',
        roles: ['user'],
      });
    });
  });

  describe('invalid refresh token', () => {
    it('should throw UnauthorizedException when token is invalid', async () => {
      const command = new RefreshTokenCommand('invalid-token');

      mockTokenService.findRefreshToken.mockResolvedValue(null);
      mockTokenService.verifyRefreshToken.mockRejectedValue(new Error('Invalid token'));

      await expect(refreshTokenUseCase.execute(command)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token is revoked', async () => {
      const command = new RefreshTokenCommand('revoked-token');

      mockTokenService.findRefreshToken.mockResolvedValue(mockRefreshTokenData);
      mockTokenService.verifyRefreshToken.mockResolvedValue({ 
        sub: 'user-123', 
        username: 'testuser', 
        roles: ['user'] 
      });
      mockTokenService.isTokenRevoked.mockResolvedValue(true);
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await expect(refreshTokenUseCase.execute(command)).rejects.toThrow(UnauthorizedException);
      await expect(refreshTokenUseCase.execute(command)).rejects.toThrow('Token has been revoked');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const command = new RefreshTokenCommand('valid-token');

      mockTokenService.findRefreshToken.mockResolvedValue(mockRefreshTokenData);
      mockTokenService.verifyRefreshToken.mockResolvedValue({ 
        sub: 'user-999', 
        username: 'testuser', 
        roles: ['user'] 
      });
      mockTokenService.isTokenRevoked.mockResolvedValue(false);
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(refreshTokenUseCase.execute(command)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('user status checks', () => {
    it('should throw UnauthorizedException when user is inactive', async () => {
      const inactiveUser = UserEntity.reconstitute({
        ...mockUser.toObject(),
        id: 'user-123',
        status: UserStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const command = new RefreshTokenCommand('valid-token');

      mockTokenService.findRefreshToken.mockResolvedValue(mockRefreshTokenData);
      mockTokenService.verifyRefreshToken.mockResolvedValue({ 
        sub: 'user-123', 
        username: 'testuser', 
        roles: ['user'] 
      });
      mockTokenService.isTokenRevoked.mockResolvedValue(false);
      mockUserRepository.findById.mockResolvedValue(inactiveUser);

      await expect(refreshTokenUseCase.execute(command)).rejects.toThrow(
        'User account is not active',
      );
    });

    it('should throw UnauthorizedException when user is suspended', async () => {
      const suspendedUser = UserEntity.reconstitute({
        ...mockUser.toObject(),
        id: 'user-123',
        status: UserStatus.SUSPENDED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const command = new RefreshTokenCommand('valid-token');

      mockTokenService.findRefreshToken.mockResolvedValue(mockRefreshTokenData);
      mockTokenService.verifyRefreshToken.mockResolvedValue({ 
        sub: 'user-123', 
        username: 'testuser', 
        roles: ['user'] 
      });
      mockTokenService.isTokenRevoked.mockResolvedValue(false);
      mockUserRepository.findById.mockResolvedValue(suspendedUser);

      await expect(refreshTokenUseCase.execute(command)).rejects.toThrow(
        'User account is not active',
      );
    });
  });
});
