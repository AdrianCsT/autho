import type { LoginResponse, RefreshResponse, VerifyResponse, AuthError } from '@/types/auth';
import { AuthError as AuthErrorClass } from './auth-errors';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class AuthService {
  private refreshToken: string | null = null;

  async login(identifier: string, password: string): Promise<LoginResponse> {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier, password }),
      });

      if (!res.ok) {
        const error: AuthError = await res.json();
        const message = Array.isArray(error.message) ? error.message.join(', ') : error.message;
        throw new AuthErrorClass(message || 'Login failed', error.statusCode);
      }

      const data: LoginResponse = await res.json();
      this.refreshToken = data.refreshToken;
      return data;
    } catch (error) {
      if (error instanceof AuthErrorClass) throw error;
      throw new AuthErrorClass('Network error. Please check your connection.');
    }
  }

  async logout(): Promise<void> {
    if (!this.refreshToken) {
      // Try to get refresh token from cookie via API route
      const cookieRes = await fetch('/api/auth/refresh-token');
      if (cookieRes.ok) {
        const { refreshToken } = await cookieRes.json();
        this.refreshToken = refreshToken;
      }
    }

    if (this.refreshToken) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
    }

    this.refreshToken = null;
  }

  async verifyToken(): Promise<VerifyResponse | null> {
    try {
      const res = await fetch(`${API_URL}/auth/verify`, {
        credentials: 'include',
      });

      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async refreshAccessToken(): Promise<RefreshResponse | null> {
    // Try to get refresh token from memory or cookie
    if (!this.refreshToken) {
      try {
        const cookieRes = await fetch('/api/auth/refresh-token');
        if (cookieRes.ok) {
          const { refreshToken } = await cookieRes.json();
          this.refreshToken = refreshToken;
        }
      } catch {
        return null;
      }
    }

    if (!this.refreshToken) return null;

    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!res.ok) {
        this.refreshToken = null;
        return null;
      }

      const data: RefreshResponse = await res.json();
      this.refreshToken = data.refreshToken;
      return data;
    } catch {
      this.refreshToken = null;
      return null;
    }
  }

  setRefreshToken(token: string) {
    this.refreshToken = token;
  }

  clearRefreshToken() {
    this.refreshToken = null;
  }
}

export const authService = new AuthService();
