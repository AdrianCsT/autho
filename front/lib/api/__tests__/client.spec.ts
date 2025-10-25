import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '../client';
import { login, refreshToken } from '../auth';

describe('API Client', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    localStorage.clear();
  });

  afterEach(() => {
    mock.restore();
    jest.clearAllMocks();
  });

  describe('Token Refresh', () => {
    it('should automatically refresh token on 401 error', async () => {
      const newAccessToken = 'new-access-token';

      // First request fails with 401
      mock.onGet('/test').replyOnce(401);

      // Refresh token request succeeds
      mock.onPost('/auth/refresh').reply(200, { accessToken: newAccessToken });

      // Retry the original request
      mock.onGet('/test').reply(200, { data: 'success' });

      const response = await apiClient.get('/test');

      expect(response.data).toEqual({ data: 'success' });
      expect(localStorage.getItem('accessToken')).toBe(newAccessToken);
    });

    it('should fail if refresh token is invalid', async () => {
      // First request fails with 401
      mock.onGet('/test').replyOnce(401);

      // Refresh token request also fails
      mock.onPost('/auth/refresh').reply(401);

      await expect(apiClient.get('/test')).rejects.toThrow();
    });
  });

  describe('Authorization Header', () => {
    it('should include authorization header when token is present', async () => {
      const accessToken = 'test-access-token';
      localStorage.setItem('accessToken', accessToken);

      mock.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBe(`Bearer ${accessToken}`);
        return [200, { data: 'success' }];
      });

      await apiClient.get('/test');
    });

    it('should not include authorization header when token is absent', async () => {
      mock.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBeUndefined();
        return [200, { data: 'success' }];
      });

      await apiClient.get('/test');
    });
  });
});

describe('Auth API', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    localStorage.clear();
  });

  afterEach(() => {
    mock.restore();
  });

  describe('login', () => {
    it('should login and store access token', async () => {
      const mockResponse = {
        accessToken: 'test-access-token',
        user: {
          id: '123',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['user'],
          status: 'ACTIVE',
        },
      };

      mock.onPost('/auth/login').reply(200, mockResponse);

      const result = await login('testuser', 'password123');

      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem('accessToken')).toBe('test-access-token');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token and update storage', async () => {
      const mockResponse = { accessToken: 'new-access-token' };

      mock.onPost('/auth/refresh').reply(200, mockResponse);

      const result = await refreshToken();

      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem('accessToken')).toBe('new-access-token');
    });
  });
});
