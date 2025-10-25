'use client';

import { useState, useCallback } from 'react';
import { usersApi } from '../lib/api';
import { getErrorMessage } from '../lib/api/client';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ChangeUserStatusRequest,
} from '../types/api/users.types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await usersApi.getAll();
      setUsers(data);
      return data;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchById = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await usersApi.getById(userId);
      setCurrentUser(user);
      return user;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const create = async (data: CreateUserRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await usersApi.create(data);
      setUsers((prev) => [...prev, user]);
      return user;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const update = async (userId: string, data: UpdateUserRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await usersApi.update(userId, data);
      setUsers((prev) => prev.map((u) => (u.id === userId ? user : u)));
      if (currentUser?.id === userId) {
        setCurrentUser(user);
      }
      return user;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const changeStatus = async (userId: string, status: ChangeUserStatusRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await usersApi.changeStatus(userId, status);
      // Update user in the list
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, status: response.user.status } : u
        )
      );
      return response;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await usersApi.delete(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (currentUser?.id === userId) {
        setCurrentUser(null);
      }
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
    users,
    currentUser,
    isLoading,
    error,
    fetchAll,
    fetchById,
    create,
    update,
    changeStatus,
    deleteUser,
    clearError,
  };
}

export default useUsers;
