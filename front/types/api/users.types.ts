export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  roles: string[];
  status: string;
}

export interface CreateUserResponse {
  user: User;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  roles?: string[];
}

export interface UpdateUserResponse {
  user: User;
}

export interface ChangeUserStatusRequest {
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface ChangeUserStatusResponse {
  user: {
    id: string;
    username: string;
    status: string;
  };
}

export interface UsersListResponse {
  users: User[];
}
