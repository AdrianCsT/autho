import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../user.repository';
import { PrismaService } from '../../prisma.service';
import { UserEntity, UserStatus } from '../../../../domain/entities/user.entity';
import { Email } from '../../../../domain/value-objects/email.vo';

describe('UserRepository', () => {
  let repository: UserRepository;
  let prisma: PrismaService;

  const mockRole = {
    id: 'role-1',
    name: 'user',
  };

  const mockPrismaUser = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashedpassword',
    status: 'ACTIVE',
    roleId: 'role-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    role: mockRole,
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user entity when user exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.findById('123');

      expect(result).toBeInstanceOf(UserEntity);
      expect(result?.id).toBe('123');
      expect(result?.username).toBe('testuser');
      expect(result?.email.getValue()).toBe('test@example.com');
      expect(result?.roles).toEqual(['user']);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        include: { role: true },
      });
    });

    it('should return null when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return a user entity when username exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.findByUsername('testuser');

      expect(result).toBeInstanceOf(UserEntity);
      expect(result?.username).toBe('testuser');
    });
  });

  describe('findByEmail', () => {
    it('should return a user entity when email exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toBeInstanceOf(UserEntity);
      expect(result?.email.getValue()).toBe('test@example.com');
    });
  });

  describe('findByUsernameOrEmail', () => {
    it('should find user by username', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockPrismaUser);

      const result = await repository.findByUsernameOrEmail('testuser');

      expect(result).toBeInstanceOf(UserEntity);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ username: 'testuser' }, { email: 'testuser' }],
        },
        include: { role: true },
      });
    });

    it('should find user by email', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockPrismaUser);

      const result = await repository.findByUsernameOrEmail('test@example.com');

      expect(result).toBeInstanceOf(UserEntity);
    });
  });

  describe('findAll', () => {
    it('should return array of user entities', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockPrismaUser]);

      const result = await repository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(UserEntity);
    });
  });

  describe('create', () => {
    it('should create and return a user entity', async () => {
      const newUser = UserEntity.create({
        username: 'newuser',
        email: Email.create('new@example.com'),
        passwordHash: 'hash',
        roles: ['user'],
        status: UserStatus.ACTIVE,
      });

      mockPrismaService.role.findUnique.mockResolvedValue(mockRole);
      mockPrismaService.user.create.mockResolvedValue({
        ...mockPrismaUser,
        id: 'new-id',
        username: 'newuser',
        email: 'new@example.com',
      });

      const result = await repository.create(newUser);

      expect(result).toBeInstanceOf(UserEntity);
      expect(mockPrismaService.role.findUnique).toHaveBeenCalledWith({ where: { name: 'user' } });
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and return user entity', async () => {
      const user = UserEntity.reconstitute({
        id: '123',
        username: 'testuser',
        email: Email.create('test@example.com'),
        passwordHash: 'hash',
        roles: ['user'],
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockPrismaService.role.findUnique.mockResolvedValue(mockRole);
      mockPrismaService.user.update.mockResolvedValue(mockPrismaUser);

      const result = await repository.update(user);

      expect(result).toBeInstanceOf(UserEntity);
      expect(mockPrismaService.role.findUnique).toHaveBeenCalledWith({ where: { name: 'user' } });
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      mockPrismaService.user.delete.mockResolvedValue(mockPrismaUser);

      await repository.delete('123');

      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });
  });

  describe('existsByUsername', () => {
    it('should return true when username exists', async () => {
      mockPrismaService.user.count.mockResolvedValue(1);

      const result = await repository.existsByUsername('testuser');

      expect(result).toBe(true);
    });

    it('should return false when username does not exist', async () => {
      mockPrismaService.user.count.mockResolvedValue(0);

      const result = await repository.existsByUsername('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('existsByEmail', () => {
    it('should return true when email exists', async () => {
      mockPrismaService.user.count.mockResolvedValue(1);

      const result = await repository.existsByEmail('test@example.com');

      expect(result).toBe(true);
    });

    it('should return false when email does not exist', async () => {
      mockPrismaService.user.count.mockResolvedValue(0);

      const result = await repository.existsByEmail('nonexistent@example.com');

      expect(result).toBe(false);
    });
  });
});
