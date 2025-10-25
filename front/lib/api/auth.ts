import apiClient, { setAccessToken } from './client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshResponse,
  LogoutResponse,
  ProfileResponse,
} from '../../types/api/auth.types';

export const authApi = {
  /**
   * Login with username/email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    // Store access token in memory
    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken);
    }
    
    return response.data;
  },

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Refresh access token using HTTP-only cookie
   */
  async refresh(): Promise<RefreshResponse> {
    const response = await apiClient.post<RefreshResponse>('/auth/refresh');
    
    // Store new access token
    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken);
    }
    
    return response.data;
  },

  /**
   * Logout current user
   */
  async logout(): Promise<LogoutResponse> {
    const response = await apiClient.post<LogoutResponse>('/auth/logout');
    
    // Clear access token from memory
    setAccessToken('');
    
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ProfileResponse> {
    const response = await apiClient.get<ProfileResponse>('/auth/profile');
    return response.data;
  },
};

export default authApi;
