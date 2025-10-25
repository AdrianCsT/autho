import apiClient from './client';
import type {
  User,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  ChangeUserStatusRequest,
  ChangeUserStatusResponse,
  UsersListResponse,
} from '../../types/api/users.types';

export const usersApi = {
  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    const response = await apiClient.get<UsersListResponse>('/users');
    return response.data.users;
  },

  /**
   * Get user by ID
   */
  async getById(userId: string): Promise<User> {
    const response = await apiClient.get<{ user: User }>(`/users/${userId}`);
    return response.data.user;
  },

  /**
   * Create new user
   */
  async create(data: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<CreateUserResponse>('/users', data);
    return response.data.user;
  },

  /**
   * Update user
   */
  async update(userId: string, data: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<UpdateUserResponse>(`/users/${userId}`, data);
    return response.data.user;
  },

  /**
   * Change user status
   */
  async changeStatus(userId: string, status: ChangeUserStatusRequest): Promise<ChangeUserStatusResponse> {
    const response = await apiClient.patch<ChangeUserStatusResponse>(
      `/users/${userId}/status`,
      status
    );
    return response.data;
  },

  /**
   * Delete user
   */
  async delete(userId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}`);
  },
};

export default usersApi;
