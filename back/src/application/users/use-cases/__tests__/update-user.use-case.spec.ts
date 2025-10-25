import { UpdateUserUseCase } from '../update-user.use-case';
import { UpdateUserCommand } from '../update-user.use-case.dto';
import { IUserRepository } from '../../../../domain/interfaces/repositories/user.repository.interface';
import { UserEntity, UserStatus } from '../../../../domain/entities/user.entity';
import { Email } from '../../../../domain/value-objects/email.vo';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UpdateUserUseCase', () => {
  let updateUserUseCase: UpdateUserUseCase;
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

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      existsByEmail: jest.fn(),
      existsByUsername: jest.fn(),
      update: jest.fn(),
    } as any;

    updateUserUseCase = new UpdateUserUseCase(mockUserRepository);
  });

  describe('successful updates', () => {
    it('should update user email', async () => {
      const command = new UpdateUserCommand('user-123', undefined, 'newemail@example.com');

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.existsByEmail.mockResolvedValue(false);

      const updatedUser = UserEntity.reconstitute({
        ...mockUser.toObject(),
        id: 'user-123',
        email: Email.create('newemail@example.com'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await updateUserUseCase.execute(command);

      expect(result.user.email).toBe('newemail@example.com');
    });

    // Note: Password updates should be handled by a separate ChangePasswordUseCase
    // Skipping password update test as it's not implemented in UpdateUserUseCase

    it('should update user roles', async () => {
      const command = new UpdateUserCommand('user-123', undefined, undefined, ['admin', 'user']);

      mockUserRepository.findById.mockResolvedValue(mockUser);

      const updatedUser = UserEntity.reconstitute({
        ...mockUser.toObject(),
        id: 'user-123',
        roles: ['admin', 'user'],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await updateUserUseCase.execute(command);

      expect(result.user.roles).toEqual(['admin', 'user']);
    });

    it('should update email and roles together', async () => {
      const command = new UpdateUserCommand(
        'user-123',
        undefined,
        'updated@example.com',
        ['admin'],
      );

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.existsByEmail.mockResolvedValue(false);

      const updatedUser = UserEntity.reconstitute({
        ...mockUser.toObject(),
        id: 'user-123',
        email: Email.create('updated@example.com'),
        roles: ['admin'],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await updateUserUseCase.execute(command);

      expect(result.user.email).toBe('updated@example.com');
      expect(result.user.roles).toEqual(['admin']);
    });
  });

  describe('validation failures', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      const command = new UpdateUserCommand('user-999', undefined, 'new@example.com');

      mockUserRepository.findById.mockResolvedValue(null);

      await expect(updateUserUseCase.execute(command)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when email already exists', async () => {
      const command = new UpdateUserCommand('user-123', undefined, 'existing@example.com');

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.existsByEmail.mockResolvedValue(true);

      await expect(updateUserUseCase.execute(command)).rejects.toThrow(ConflictException);
    });

    it('should throw error for invalid email format', async () => {
      const command = new UpdateUserCommand('user-123', undefined, 'invalid-email');

      mockUserRepository.findById.mockResolvedValue(mockUser);

      await expect(updateUserUseCase.execute(command)).rejects.toThrow('Invalid email format');
    });
  });

  describe('edge cases', () => {
    it('should allow same email if it belongs to the user', async () => {
      const command = new UpdateUserCommand('user-123', undefined, 'test@example.com');

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.update.mockResolvedValue(mockUser);

      const result = await updateUserUseCase.execute(command);

      expect(result.user.email).toBe('test@example.com');
    });
  });
});
