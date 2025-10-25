export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  status: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface RefreshResponse {
  message: string;
  accessToken: string;
}

export interface LogoutResponse {
  message: string;
}

export interface ProfileResponse {
  user: User;
}
