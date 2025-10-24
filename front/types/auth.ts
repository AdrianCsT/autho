export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  message: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface VerifyResponse {
  valid: boolean;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

export interface AuthError {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}
