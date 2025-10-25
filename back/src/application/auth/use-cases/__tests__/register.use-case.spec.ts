import { RegisterUseCase } from '../register.use-case';
import { RegisterCommand } from '../register.use-case.dto';
import { IUserRepository } from '../../../../domain/interfaces/repositories/user.repository.interface';
import { IPasswordHasher } from '../../../../domain/interfaces/services/password-hasher.interface';
import { UserEntity, UserStatus } from '../../../../domain/entities/user.entity';
import { Email } from '../../../../domain/value-objects/email.vo';
import { ConflictException } from '@nestjs/common';

describe('RegisterUseCase', () => {
  let registerUseCase: RegisterUseCase;
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

    registerUseCase = new RegisterUseCase(mockUserRepository, mockPasswordHasher);
  });

  describe('successful registration', () => {
    it('should create new user when all validations pass', async () => {
      const command = new RegisterCommand('newuser', 'test@example.com', 'Password123');

      mockUserRepository.existsByUsername.mockResolvedValue(false);
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashedPassword123');

      const mockCreatedUser = UserEntity.reconstitute({
        id: 'user-123',
        username: 'newuser',
        email: Email.create('test@example.com'),
        passwordHash: 'hashedPassword123',
        roles: ['user'],
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserRepository.create.mockResolvedValue(mockCreatedUser);

      const result = await registerUseCase.execute(command);

      expect(result.user.username).toBe('newuser');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.roles).toContain('user');
      expect(result.user.status).toBe('ACTIVE');
    });

    it('should hash password before creating user', async () => {
      const command = new RegisterCommand('newuser', 'test@example.com', 'Password123');

      mockUserRepository.existsByUsername.mockResolvedValue(false);
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashedPassword123');

      const mockCreatedUser = UserEntity.reconstitute({
        id: 'user-123',
        username: 'newuser',
        email: Email.create('test@example.com'),
        passwordHash: 'hashedPassword123',
        roles: ['user'],
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserRepository.create.mockResolvedValue(mockCreatedUser);

      await registerUseCase.execute(command);

      expect(mockPasswordHasher.hash).toHaveBeenCalledWith('Password123');
    });

    it('should assign default user role', async () => {
      const command = new RegisterCommand('newuser', 'test@example.com', 'Password123');

      mockUserRepository.existsByUsername.mockResolvedValue(false);
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashedPassword123');

      const mockCreatedUser = UserEntity.reconstitute({
        id: 'user-123',
        username: 'newuser',
        email: Email.create('test@example.com'),
        passwordHash: 'hashedPassword123',
        roles: ['user'],
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserRepository.create.mockResolvedValue(mockCreatedUser);

      const result = await registerUseCase.execute(command);

      expect(result.user.roles).toEqual(['user']);
    });
  });

  describe('validation failures', () => {
    it('should throw ConflictException when username already exists', async () => {
      const command = new RegisterCommand('existinguser', 'test@example.com', 'Password123');

      mockUserRepository.existsByUsername.mockResolvedValue(true);
      mockUserRepository.existsByEmail.mockResolvedValue(false);

      await expect(registerUseCase.execute(command)).rejects.toThrow(ConflictException);
      await expect(registerUseCase.execute(command)).rejects.toThrow('Username already exists');
    });

    it('should throw ConflictException when email already exists', async () => {
      const command = new RegisterCommand('newuser', 'existing@example.com', 'Password123');

      mockUserRepository.existsByUsername.mockResolvedValue(false);
      mockUserRepository.existsByEmail.mockResolvedValue(true);

      await expect(registerUseCase.execute(command)).rejects.toThrow(ConflictException);
      await expect(registerUseCase.execute(command)).rejects.toThrow('Email already exists');
    });

    it('should throw error for invalid email format', async () => {
      const command = new RegisterCommand('newuser', 'invalid-email', 'Password123');

      await expect(registerUseCase.execute(command)).rejects.toThrow('Invalid email format');
    });

    it('should throw error for weak password', async () => {
      const command = new RegisterCommand('newuser', 'test@example.com', 'weak');

      mockUserRepository.existsByUsername.mockResolvedValue(false);
      mockUserRepository.existsByEmail.mockResolvedValue(false);

      await expect(registerUseCase.execute(command)).rejects.toThrow(
        'Password must be at least 8 characters long',
      );
    });

    it('should throw error for password without numbers', async () => {
      const command = new RegisterCommand('newuser', 'test@example.com', 'Password');

      mockUserRepository.existsByUsername.mockResolvedValue(false);
      mockUserRepository.existsByEmail.mockResolvedValue(false);

      await expect(registerUseCase.execute(command)).rejects.toThrow(
        'Password must contain at least one letter and one number',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle email case insensitivity', async () => {
      const command = new RegisterCommand('newuser', 'TEST@EXAMPLE.COM', 'Password123');

      mockUserRepository.existsByUsername.mockResolvedValue(false);
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashedPassword123');

      const mockCreatedUser = UserEntity.reconstitute({
        id: 'user-123',
        username: 'newuser',
        email: Email.create('test@example.com'),
        passwordHash: 'hashedPassword123',
        roles: ['user'],
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserRepository.create.mockResolvedValue(mockCreatedUser);

      const result = await registerUseCase.execute(command);

      expect(result.user.email).toBe('test@example.com');
    });
  });
});
