import { CreateUserUseCase } from '../create-user.use-case';
import { CreateUserCommand } from '../create-user.use-case.dto';
import { IUserRepository } from '../../../../domain/interfaces/repositories/user.repository.interface';
import { IPasswordHasher } from '../../../../domain/interfaces/services/password-hasher.interface';
import { UserEntity, UserStatus } from '../../../../domain/entities/user.entity';
import { Email } from '../../../../domain/value-objects/email.vo';
import { ConflictException } from '@nestjs/common';

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockPasswordHasher: jest.Mocked<IPasswordHasher>;

  beforeEach(() => {
    mockUserRepository = {
      existsByUsername: jest.fn(),
      existsByEmail: jest.fn(),
      create: jest.fn(),
    } as any;

    mockPasswordHasher = {
      hash: jest.fn(),
    } as any;

    createUserUseCase = new CreateUserUseCase(mockUserRepository, mockPasswordHasher);
  });

  describe('successful user creation', () => {
    it('should create user with provided roles', async () => {
      const command = new CreateUserCommand(
        'adminuser',
        'admin@example.com',
        'Password123',
        ['admin', 'user'],
        UserStatus.ACTIVE,
      );

      mockUserRepository.existsByUsername.mockResolvedValue(false);
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashedPassword123');

      const mockCreatedUser = UserEntity.reconstitute({
        id: 'user-123',
        username: 'adminuser',
        email: Email.create('admin@example.com'),
        passwordHash: 'hashedPassword123',
        roles: ['admin', 'user'],
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserRepository.create.mockResolvedValue(mockCreatedUser);

      const result = await createUserUseCase.execute(command);

      expect(result.user.username).toBe('adminuser');
      expect(result.user.roles).toEqual(['admin', 'user']);
      expect(result.user.status).toBe('ACTIVE');
    });

    it('should create user with custom status', async () => {
      const command = new CreateUserCommand(
        'inactiveuser',
        'inactive@example.com',
        'Password123',
        ['user'],
        UserStatus.INACTIVE,
      );

      mockUserRepository.existsByUsername.mockResolvedValue(false);
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashedPassword123');

      const mockCreatedUser = UserEntity.reconstitute({
        id: 'user-123',
        username: 'inactiveuser',
        email: Email.create('inactive@example.com'),
        passwordHash: 'hashedPassword123',
        roles: ['user'],
        status: UserStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserRepository.create.mockResolvedValue(mockCreatedUser);

      const result = await createUserUseCase.execute(command);

      expect(result.user.status).toBe('INACTIVE');
    });
  });

  describe('validation failures', () => {
    it('should throw ConflictException when username exists', async () => {
      const command = new CreateUserCommand(
        'existinguser',
        'new@example.com',
        'Password123',
        ['user'],
        UserStatus.ACTIVE,
      );

      mockUserRepository.existsByUsername.mockResolvedValue(true);
      mockUserRepository.existsByEmail.mockResolvedValue(false);

      await expect(createUserUseCase.execute(command)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when email exists', async () => {
      const command = new CreateUserCommand(
        'newuser',
        'existing@example.com',
        'Password123',
        ['user'],
        UserStatus.ACTIVE,
      );

      mockUserRepository.existsByUsername.mockResolvedValue(false);
      mockUserRepository.existsByEmail.mockResolvedValue(true);

      await expect(createUserUseCase.execute(command)).rejects.toThrow(ConflictException);
    });

    it('should throw error for invalid email', async () => {
      const command = new CreateUserCommand('newuser', 'invalid-email', 'Password123', ['user'], UserStatus.ACTIVE);

      await expect(createUserUseCase.execute(command)).rejects.toThrow('Invalid email format');
    });

    it('should throw error for weak password', async () => {
      const command = new CreateUserCommand('newuser', 'test@example.com', 'weak', ['user'], UserStatus.ACTIVE);

      mockUserRepository.existsByUsername.mockResolvedValue(false);
      mockUserRepository.existsByEmail.mockResolvedValue(false);

      await expect(createUserUseCase.execute(command)).rejects.toThrow(
        'Password must be at least 8 characters long',
      );
    });
  });
});
