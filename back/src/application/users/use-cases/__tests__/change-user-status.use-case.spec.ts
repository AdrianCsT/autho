import { ChangeUserStatusUseCase } from '../change-user-status.use-case';
import { ChangeUserStatusCommand } from '../change-user-status.use-case.dto';
import { IUserRepository } from '../../../../domain/interfaces/repositories/user.repository.interface';
import { ITokenService } from '../../../../domain/interfaces/services/token-service.interface';
import { UserEntity, UserStatus } from '../../../../domain/entities/user.entity';
import { Email } from '../../../../domain/value-objects/email.vo';
import { NotFoundException } from '@nestjs/common';

describe('ChangeUserStatusUseCase', () => {
  let changeUserStatusUseCase: ChangeUserStatusUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockTokenService: jest.Mocked<ITokenService>;

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
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    mockTokenService = {
      revokeUserTokens: jest.fn(),
    } as any;

    changeUserStatusUseCase = new ChangeUserStatusUseCase(mockUserRepository, mockTokenService);
  });

  describe('status changes', () => {
    it('should suspend active user', async () => {
      const command = new ChangeUserStatusCommand('user-123', UserStatus.SUSPENDED);

      mockUserRepository.findById.mockResolvedValue(mockUser);

      const suspendedUser = UserEntity.reconstitute({
        ...mockUser.toObject(),
        id: 'user-123',
        status: UserStatus.SUSPENDED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserRepository.update.mockResolvedValue(suspendedUser);

      const result = await changeUserStatusUseCase.execute(command);

      expect(result.user.status).toBe('SUSPENDED');
      expect(mockTokenService.revokeUserTokens).toHaveBeenCalledWith('user-123');
    });

    it('should activate inactive user', async () => {
      const inactiveUser = UserEntity.reconstitute({
        ...mockUser.toObject(),
        id: 'user-123',
        status: UserStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const command = new ChangeUserStatusCommand('user-123', UserStatus.ACTIVE);

      mockUserRepository.findById.mockResolvedValue(inactiveUser);

      const activatedUser = UserEntity.reconstitute({
        ...mockUser.toObject(),
        id: 'user-123',
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserRepository.update.mockResolvedValue(activatedUser);

      const result = await changeUserStatusUseCase.execute(command);

      expect(result.user.status).toBe('ACTIVE');
    });

    it('should deactivate active user', async () => {
      const command = new ChangeUserStatusCommand('user-123', UserStatus.INACTIVE);

      mockUserRepository.findById.mockResolvedValue(mockUser);

      const inactiveUser = UserEntity.reconstitute({
        ...mockUser.toObject(),
        id: 'user-123',
        status: UserStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserRepository.update.mockResolvedValue(inactiveUser);

      const result = await changeUserStatusUseCase.execute(command);

      expect(result.user.status).toBe('INACTIVE');
      expect(mockTokenService.revokeUserTokens).toHaveBeenCalledWith('user-123');
    });
  });

  describe('token revocation', () => {
    it('should revoke tokens when suspending user', async () => {
      const command = new ChangeUserStatusCommand('user-123', UserStatus.SUSPENDED);

      mockUserRepository.findById.mockResolvedValue(mockUser);

      const suspendedUser = UserEntity.reconstitute({
        ...mockUser.toObject(),
        id: 'user-123',
        status: UserStatus.SUSPENDED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserRepository.update.mockResolvedValue(suspendedUser);

      await changeUserStatusUseCase.execute(command);

      expect(mockTokenService.revokeUserTokens).toHaveBeenCalledWith('user-123');
    });

    it('should revoke tokens when deactivating user', async () => {
      const command = new ChangeUserStatusCommand('user-123', UserStatus.INACTIVE);

      mockUserRepository.findById.mockResolvedValue(mockUser);

      const inactiveUser = UserEntity.reconstitute({
        ...mockUser.toObject(),
        id: 'user-123',
        status: UserStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserRepository.update.mockResolvedValue(inactiveUser);

      await changeUserStatusUseCase.execute(command);

      expect(mockTokenService.revokeUserTokens).toHaveBeenCalledWith('user-123');
    });

    it('should not revoke tokens when activating user', async () => {
      const inactiveUser = UserEntity.reconstitute({
        ...mockUser.toObject(),
        id: 'user-123',
        status: UserStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const command = new ChangeUserStatusCommand('user-123', UserStatus.ACTIVE);

      mockUserRepository.findById.mockResolvedValue(inactiveUser);

      const activatedUser = UserEntity.reconstitute({
        ...mockUser.toObject(),
        id: 'user-123',
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserRepository.update.mockResolvedValue(activatedUser);

      await changeUserStatusUseCase.execute(command);

      expect(mockTokenService.revokeUserTokens).not.toHaveBeenCalled();
    });
  });

  describe('validation failures', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      const command = new ChangeUserStatusCommand('user-999', UserStatus.SUSPENDED);

      mockUserRepository.findById.mockResolvedValue(null);

      await expect(changeUserStatusUseCase.execute(command)).rejects.toThrow(NotFoundException);
    });
  });
});
