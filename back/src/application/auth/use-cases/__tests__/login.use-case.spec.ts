import { LoginUseCase } from '../login.use-case';
import { LoginCommand } from '../login.use-case.dto';
import { IUserRepository } from '../../../../domain/interfaces/repositories/user.repository.interface';
import { IPasswordHasher } from '../../../../domain/interfaces/services/password-hasher.interface';
import { ITokenService } from '../../../../domain/interfaces/services/token-service.interface';
import { ILoginLogsService } from '../../../../domain/interfaces/services/login-logs.interface';
import { UserEntity, UserStatus } from '../../../../domain/entities/user.entity';
import { Email } from '../../../../domain/value-objects/email.vo';
import { UnauthorizedException } from '@nestjs/common';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockPasswordHasher: jest.Mocked<IPasswordHasher>;
  let mockTokenService: jest.Mocked<ITokenService>;
  let mockLoginLogsService: jest.Mocked<ILoginLogsService>;

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

  beforeEach(() => {
    mockUserRepository = {
      findByUsernameOrEmail: jest.fn(),
    } as any;

    mockPasswordHasher = {
      compare: jest.fn(),
      hash: jest.fn(),
    };

    mockTokenService = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      saveRefreshToken: jest.fn(),
    } as any;

    mockLoginLogsService = {
      logAttempt: jest.fn(),
      getRecentFailedAttempts: jest.fn(),
    };

    loginUseCase = new LoginUseCase(
      mockUserRepository,
      mockPasswordHasher,
      mockTokenService,
      mockLoginLogsService,
    );
  });

  describe('successful login', () => {
    it('should return tokens and user data when credentials are valid', async () => {
      const command = new LoginCommand('testuser', 'password123', '127.0.0.1', 'Mozilla/5.0');

      mockLoginLogsService.getRecentFailedAttempts.mockResolvedValue(0);
      mockUserRepository.findByUsernameOrEmail.mockResolvedValue(mockUser);
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockResolvedValue('access-token');
      mockTokenService.generateRefreshToken.mockResolvedValue('refresh-token');

      const result = await loginUseCase.execute(command);

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user.username).toBe('testuser');
      expect(mockLoginLogsService.logAttempt).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          success: true,
        }),
      );
    });

    it('should generate tokens with correct payload', async () => {
      const command = new LoginCommand('testuser', 'password123');

      mockLoginLogsService.getRecentFailedAttempts.mockResolvedValue(0);
      mockUserRepository.findByUsernameOrEmail.mockResolvedValue(mockUser);
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockResolvedValue('access-token');
      mockTokenService.generateRefreshToken.mockResolvedValue('refresh-token');

      await loginUseCase.execute(command);

      expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith({
        sub: 'user-123',
        username: 'testuser',
        roles: ['user'],
      });
    });

    it('should save refresh token', async () => {
      const command = new LoginCommand('testuser', 'password123');

      mockLoginLogsService.getRecentFailedAttempts.mockResolvedValue(0);
      mockUserRepository.findByUsernameOrEmail.mockResolvedValue(mockUser);
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockResolvedValue('access-token');
      mockTokenService.generateRefreshToken.mockResolvedValue('refresh-token');

      await loginUseCase.execute(command);

      expect(mockTokenService.saveRefreshToken).toHaveBeenCalledWith(
        'user-123',
        'refresh-token',
        expect.any(Date),
      );
    });
  });

  describe('failed login - invalid credentials', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      const command = new LoginCommand('nonexistent', 'password');

      mockLoginLogsService.getRecentFailedAttempts.mockResolvedValue(0);
      mockUserRepository.findByUsernameOrEmail.mockResolvedValue(null);

      await expect(loginUseCase.execute(command)).rejects.toThrow(UnauthorizedException);
      expect(mockLoginLogsService.logAttempt).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          reason: 'User not found',
        }),
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const command = new LoginCommand('testuser', 'wrongpassword');

      mockLoginLogsService.getRecentFailedAttempts.mockResolvedValue(0);
      mockUserRepository.findByUsernameOrEmail.mockResolvedValue(mockUser);
      mockPasswordHasher.compare.mockResolvedValue(false);

      await expect(loginUseCase.execute(command)).rejects.toThrow(UnauthorizedException);
      expect(mockLoginLogsService.logAttempt).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          reason: 'Invalid password',
        }),
      );
    });
  });

  describe('failed login - account status', () => {
    it('should throw UnauthorizedException when user is suspended', async () => {
      const suspendedUser = UserEntity.reconstitute({
        ...mockUser.toObject(),
        id: 'user-123',
        status: UserStatus.SUSPENDED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const command = new LoginCommand('testuser', 'password123');

      mockLoginLogsService.getRecentFailedAttempts.mockResolvedValue(0);
      mockUserRepository.findByUsernameOrEmail.mockResolvedValue(suspendedUser);
      mockPasswordHasher.compare.mockResolvedValue(true);

      await expect(loginUseCase.execute(command)).rejects.toThrow(
        'Your account has been suspended',
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const inactiveUser = UserEntity.reconstitute({
        ...mockUser.toObject(),
        id: 'user-123',
        status: UserStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const command = new LoginCommand('testuser', 'password123');

      mockLoginLogsService.getRecentFailedAttempts.mockResolvedValue(0);
      mockUserRepository.findByUsernameOrEmail.mockResolvedValue(inactiveUser);
      mockPasswordHasher.compare.mockResolvedValue(true);

      await expect(loginUseCase.execute(command)).rejects.toThrow('Your account is inactive');
    });
  });

  describe('rate limiting', () => {
    it('should throw UnauthorizedException when too many failed attempts', async () => {
      const command = new LoginCommand('testuser', 'password123');

      mockLoginLogsService.getRecentFailedAttempts.mockResolvedValue(5);

      await expect(loginUseCase.execute(command)).rejects.toThrow('Too many failed login attempts');
      expect(mockLoginLogsService.logAttempt).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          reason: 'Account temporarily locked due to too many failed attempts',
        }),
      );
    });

    it('should allow login when failed attempts are below threshold', async () => {
      const command = new LoginCommand('testuser', 'password123');

      mockLoginLogsService.getRecentFailedAttempts.mockResolvedValue(4);
      mockUserRepository.findByUsernameOrEmail.mockResolvedValue(mockUser);
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockResolvedValue('access-token');
      mockTokenService.generateRefreshToken.mockResolvedValue('refresh-token');

      const result = await loginUseCase.execute(command);

      expect(result.accessToken).toBeDefined();
    });
  });
});
