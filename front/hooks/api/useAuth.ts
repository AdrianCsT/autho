'use client';

import { useState } from 'react';
import { authApi } from '../lib/api';
import { getErrorMessage } from '../lib/api/client';
import type { LoginRequest, RegisterRequest, User } from '../types/api/auth.types';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(credentials);
      return response;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.register(data);
      return response;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authApi.logout();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getProfile = async (): Promise<User> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.getProfile();
      return response.user;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.refresh();
      return response;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    login,
    register,
    logout,
    getProfile,
    refresh,
    isLoading,
    error,
    clearError,
  };
}

export default useAuth;
