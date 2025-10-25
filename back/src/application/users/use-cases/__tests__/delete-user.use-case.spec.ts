import { DeleteUserUseCase } from '../delete-user.use-case';
import { DeleteUserCommand } from '../delete-user.use-case.dto';
import { IUserRepository } from '../../../../domain/interfaces/repositories/user.repository.interface';
import { ITokenService } from '../../../../domain/interfaces/services/token-service.interface';
import { UserEntity, UserStatus } from '../../../../domain/entities/user.entity';
import { Email } from '../../../../domain/value-objects/email.vo';
import { NotFoundException } from '@nestjs/common';

describe('DeleteUserUseCase', () => {
  let deleteUserUseCase: DeleteUserUseCase;
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
      delete: jest.fn(),
    } as any;

    mockTokenService = {
      revokeUserTokens: jest.fn(),
    } as any;

    deleteUserUseCase = new DeleteUserUseCase(mockUserRepository, mockTokenService);
  });

  describe('successful deletion', () => {
    it('should delete user and revoke tokens', async () => {
      const command = new DeleteUserCommand('user-123');

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue();

      await deleteUserUseCase.execute(command);

      expect(mockTokenService.revokeUserTokens).toHaveBeenCalledWith('user-123');
      expect(mockUserRepository.delete).toHaveBeenCalledWith('user-123');
    });

    it('should revoke tokens before deleting user', async () => {
      const command = new DeleteUserCommand('user-123');

      mockUserRepository.findById.mockResolvedValue(mockUser);

      const callOrder: string[] = [];
      mockTokenService.revokeUserTokens.mockImplementation(async () => {
        callOrder.push('revoke');
      });
      mockUserRepository.delete.mockImplementation(async () => {
        callOrder.push('delete');
      });

      await deleteUserUseCase.execute(command);

      expect(callOrder).toEqual(['revoke', 'delete']);
    });

    it('should delete inactive users', async () => {
      const inactiveUser = UserEntity.reconstitute({
        ...mockUser.toObject(),
        id: 'user-123',
        status: UserStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const command = new DeleteUserCommand('user-123');

      mockUserRepository.findById.mockResolvedValue(inactiveUser);
      mockUserRepository.delete.mockResolvedValue();

      await deleteUserUseCase.execute(command);

      expect(mockUserRepository.delete).toHaveBeenCalledWith('user-123');
    });

    it('should delete suspended users', async () => {
      const suspendedUser = UserEntity.reconstitute({
        ...mockUser.toObject(),
        id: 'user-123',
        status: UserStatus.SUSPENDED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const command = new DeleteUserCommand('user-123');

      mockUserRepository.findById.mockResolvedValue(suspendedUser);
      mockUserRepository.delete.mockResolvedValue();

      await deleteUserUseCase.execute(command);

      expect(mockUserRepository.delete).toHaveBeenCalledWith('user-123');
    });
  });

  describe('validation failures', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      const command = new DeleteUserCommand('user-999');

      mockUserRepository.findById.mockResolvedValue(null);

      await expect(deleteUserUseCase.execute(command)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should continue deletion even if token revocation fails', async () => {
      const command = new DeleteUserCommand('user-123');

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockTokenService.revokeUserTokens.mockRejectedValue(new Error('Token service error'));
      mockUserRepository.delete.mockResolvedValue();

      // Should not throw, deletion should proceed
      await expect(deleteUserUseCase.execute(command)).resolves.not.toThrow();
      expect(mockUserRepository.delete).toHaveBeenCalledWith('user-123');
    });
  });
});
