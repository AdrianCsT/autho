import { UserEntity, UserStatus } from '../../entities/user.entity';
import { Email } from '../../value-objects/email.vo';

describe('UserEntity', () => {
  const mockEmail = Email.create('test@example.com');
  const mockProps = {
    username: 'testuser',
    email: mockEmail,
    passwordHash: 'hashedPassword123',
    roles: ['user'],
    status: UserStatus.ACTIVE,
  };

  describe('create', () => {
    it('should create a new user entity', () => {
      const user = UserEntity.create(mockProps);

      expect(user.username).toBe('testuser');
      expect(user.email).toBe(mockEmail);
      expect(user.passwordHash).toBe('hashedPassword123');
      expect(user.roles).toEqual(['user']);
      expect(user.status).toBe(UserStatus.ACTIVE);
    });

    it('should set default timestamps', () => {
      const user = UserEntity.create(mockProps);
      
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should return copy of roles array', () => {
      const user = UserEntity.create(mockProps);
      const roles = user.roles;
      
      roles.push('admin');
      expect(user.roles).not.toContain('admin');
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute user from persistence', () => {
      const persistedProps = {
        id: '123',
        ...mockProps,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      const user = UserEntity.reconstitute(persistedProps);

      expect(user.id).toBe('123');
      expect(user.username).toBe('testuser');
      expect(user.createdAt).toEqual(new Date('2023-01-01'));
    });
  });

  describe('business methods', () => {
    describe('isActive', () => {
      it('should return true for active user', () => {
        const user = UserEntity.create({ ...mockProps, status: UserStatus.ACTIVE });
        expect(user.isActive()).toBe(true);
      });

      it('should return false for inactive user', () => {
        const user = UserEntity.create({ ...mockProps, status: UserStatus.INACTIVE });
        expect(user.isActive()).toBe(false);
      });
    });

    describe('isSuspended', () => {
      it('should return true for suspended user', () => {
        const user = UserEntity.create({ ...mockProps, status: UserStatus.SUSPENDED });
        expect(user.isSuspended()).toBe(true);
      });

      it('should return false for active user', () => {
        const user = UserEntity.create({ ...mockProps, status: UserStatus.ACTIVE });
        expect(user.isSuspended()).toBe(false);
      });
    });

    describe('canLogin', () => {
      it('should return true for active user', () => {
        const user = UserEntity.create({ ...mockProps, status: UserStatus.ACTIVE });
        expect(user.canLogin()).toBe(true);
      });

      it('should return false for inactive user', () => {
        const user = UserEntity.create({ ...mockProps, status: UserStatus.INACTIVE });
        expect(user.canLogin()).toBe(false);
      });

      it('should return false for suspended user', () => {
        const user = UserEntity.create({ ...mockProps, status: UserStatus.SUSPENDED });
        expect(user.canLogin()).toBe(false);
      });
    });

    describe('hasRole', () => {
      it('should return true if user has role', () => {
        const user = UserEntity.create({ ...mockProps, roles: ['user', 'admin'] });
        expect(user.hasRole('admin')).toBe(true);
      });

      it('should return false if user does not have role', () => {
        const user = UserEntity.create({ ...mockProps, roles: ['user'] });
        expect(user.hasRole('admin')).toBe(false);
      });
    });

    describe('hasAnyRole', () => {
      it('should return true if user has any of the roles', () => {
        const user = UserEntity.create({ ...mockProps, roles: ['user', 'editor'] });
        expect(user.hasAnyRole(['admin', 'editor'])).toBe(true);
      });

      it('should return false if user has none of the roles', () => {
        const user = UserEntity.create({ ...mockProps, roles: ['user'] });
        expect(user.hasAnyRole(['admin', 'moderator'])).toBe(false);
      });
    });

    describe('activate', () => {
      it('should activate inactive user', () => {
        const user = UserEntity.create({ ...mockProps, status: UserStatus.INACTIVE });
        user.activate();
        expect(user.isActive()).toBe(true);
      });

      it('should update timestamp when activated', () => {
        const user = UserEntity.create({ ...mockProps, status: UserStatus.INACTIVE });
        const originalUpdatedAt = user.updatedAt;
        
        // Wait a bit to ensure timestamp changes
        jest.useFakeTimers();
        jest.advanceTimersByTime(100);
        
        user.activate();
        expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
        
        jest.useRealTimers();
      });

      it('should throw error if already active', () => {
        const user = UserEntity.create({ ...mockProps, status: UserStatus.ACTIVE });
        expect(() => user.activate()).toThrow('User is already active');
      });
    });

    describe('suspend', () => {
      it('should suspend active user', () => {
        const user = UserEntity.create({ ...mockProps, status: UserStatus.ACTIVE });
        user.suspend();
        expect(user.isSuspended()).toBe(true);
      });

      it('should throw error if already suspended', () => {
        const user = UserEntity.create({ ...mockProps, status: UserStatus.SUSPENDED });
        expect(() => user.suspend()).toThrow('User is already suspended');
      });
    });

    describe('deactivate', () => {
      it('should deactivate active user', () => {
        const user = UserEntity.create({ ...mockProps, status: UserStatus.ACTIVE });
        user.deactivate();
        expect(user.isInactive()).toBe(true);
      });

      it('should throw error if already inactive', () => {
        const user = UserEntity.create({ ...mockProps, status: UserStatus.INACTIVE });
        expect(() => user.deactivate()).toThrow('User is already inactive');
      });
    });

    describe('addRole', () => {
      it('should add role to user', () => {
        const user = UserEntity.create({ ...mockProps, roles: ['user'] });
        user.addRole('admin');
        expect(user.hasRole('admin')).toBe(true);
      });

      it('should throw error if role already exists', () => {
        const user = UserEntity.create({ ...mockProps, roles: ['user'] });
        expect(() => user.addRole('user')).toThrow('User already has role: user');
      });
    });

    describe('removeRole', () => {
      it('should remove role from user', () => {
        const user = UserEntity.create({ ...mockProps, roles: ['user', 'admin'] });
        user.removeRole('admin');
        expect(user.hasRole('admin')).toBe(false);
      });

      it('should throw error if role does not exist', () => {
        const user = UserEntity.create({ ...mockProps, roles: ['user'] });
        expect(() => user.removeRole('admin')).toThrow('User does not have role: admin');
      });
    });

    describe('updatePassword', () => {
      it('should update password hash', () => {
        const user = UserEntity.create(mockProps);
        user.updatePassword('newHashedPassword');
        expect(user.passwordHash).toBe('newHashedPassword');
      });

      it('should update timestamp', () => {
        const user = UserEntity.create(mockProps);
        const originalUpdatedAt = user.updatedAt;
        
        jest.useFakeTimers();
        jest.advanceTimersByTime(100);
        
        user.updatePassword('newHash');
        expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
        
        jest.useRealTimers();
      });
    });
  });

  describe('toPersistence', () => {
    it('should return persistence format', () => {
      const user = UserEntity.reconstitute({
        id: '123',
        ...mockProps,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      });

      const persistence = user.toPersistence();

      expect(persistence.id).toBe('123');
      expect(persistence.username).toBe('testuser');
      expect(persistence.email).toBe('test@example.com');
      expect(persistence.status).toBe(UserStatus.ACTIVE);
    });
  });

  describe('toObject', () => {
    it('should return object representation', () => {
      const user = UserEntity.create(mockProps);
      const obj = user.toObject();

      expect(obj.username).toBe('testuser');
      expect(obj.email).toBe(mockEmail);
      expect(obj.roles).toEqual(['user']);
    });

    it('should return copy of roles array', () => {
      const user = UserEntity.create(mockProps);
      const obj = user.toObject();
      
      obj.roles.push('admin');
      expect(user.roles).not.toContain('admin');
    });
  });
});
