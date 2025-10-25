import { renderHook, waitFor } from '@testing-library/react';
import { useUsers } from '../useUsers';
import * as usersApi from '@/lib/api/users';
import type { User } from '@/types/api/users.types';

jest.mock('@/lib/api/users');

describe('useUsers', () => {
  const mockUser: User = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['user'],
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  };

  const mockUsers: User[] = [mockUser];

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should fetch users successfully', async () => {
      (usersApi.getUsers as jest.Mock).mockResolvedValue({ users: mockUsers });

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        result.current.getUsers();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(usersApi.getUsers).toHaveBeenCalled();
    });

    it('should handle fetch error', async () => {
      const errorMessage = 'Failed to fetch users';
      (usersApi.getUsers as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        result.current.getUsers();
      });

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('getUserById', () => {
    it('should fetch user by id successfully', async () => {
      (usersApi.getUserById as jest.Mock).mockResolvedValue({ user: mockUser });

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        result.current.getUserById('123');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(usersApi.getUserById).toHaveBeenCalledWith('123');
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const createResponse = { message: 'User created successfully', user: mockUser };
      (usersApi.createUser as jest.Mock).mockResolvedValue(createResponse);

      const { result } = renderHook(() => useUsers());

      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        roles: ['user'],
      };

      await waitFor(() => {
        result.current.createUser(userData);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(usersApi.createUser).toHaveBeenCalledWith(userData);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateResponse = { message: 'User updated successfully', user: mockUser };
      (usersApi.updateUser as jest.Mock).mockResolvedValue(updateResponse);

      const { result } = renderHook(() => useUsers());

      const updateData = { email: 'updated@example.com' };

      await waitFor(() => {
        result.current.updateUser('123', updateData);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(usersApi.updateUser).toHaveBeenCalledWith('123', updateData);
    });
  });

  describe('changeUserStatus', () => {
    it('should change user status successfully', async () => {
      const statusResponse = { message: 'Status changed successfully', user: mockUser };
      (usersApi.changeUserStatus as jest.Mock).mockResolvedValue(statusResponse);

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        result.current.changeUserStatus('123', 'SUSPENDED');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(usersApi.changeUserStatus).toHaveBeenCalledWith('123', 'SUSPENDED');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const deleteResponse = { message: 'User deleted successfully' };
      (usersApi.deleteUser as jest.Mock).mockResolvedValue(deleteResponse);

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        result.current.deleteUser('123');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(usersApi.deleteUser).toHaveBeenCalledWith('123');
    });
  });
});
