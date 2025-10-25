import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';
import * as authApi from '@/lib/api/auth';
import type { AuthResponse } from '@/types/api/auth.types';

jest.mock('@/lib/api/auth');

describe('useAuth', () => {
  const mockAuthResponse: AuthResponse = {
    accessToken: 'test-access-token',
    user: {
      id: '123',
      username: 'testuser',
      email: 'test@example.com',
      roles: ['user'],
      status: 'ACTIVE',
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      (authApi.login as jest.Mock).mockResolvedValue(mockAuthResponse);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        result.current.login('testuser', 'password123');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(authApi.login).toHaveBeenCalledWith('testuser', 'password123');
    });

    it('should handle login error', async () => {
      const errorMessage = 'Invalid credentials';
      (authApi.login as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        result.current.login('testuser', 'wrongpassword');
      });

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const registerResponse = {
        message: 'User registered successfully',
        user: mockAuthResponse.user,
      };
      (authApi.register as jest.Mock).mockResolvedValue(registerResponse);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        result.current.register('newuser', 'new@example.com', 'password123');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(authApi.register).toHaveBeenCalledWith(
        'newuser',
        'new@example.com',
        'password123'
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      (authApi.logout as jest.Mock).mockResolvedValue({ message: 'Logout successful' });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        result.current.logout();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(authApi.logout).toHaveBeenCalled();
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh token successfully', async () => {
      const refreshResponse = { accessToken: 'new-access-token' };
      (authApi.refreshToken as jest.Mock).mockResolvedValue(refreshResponse);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        result.current.refreshAccessToken();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(authApi.refreshToken).toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      (authApi.getProfile as jest.Mock).mockResolvedValue({ user: mockAuthResponse.user });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        result.current.getProfile();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(authApi.getProfile).toHaveBeenCalled();
    });
  });
});
