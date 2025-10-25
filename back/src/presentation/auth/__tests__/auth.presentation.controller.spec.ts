import { Test, TestingModule } from '@nestjs/testing';
import { AuthPresentationController } from '../auth.presentation.controller';
import { LoginUseCase } from '../../../application/auth/use-cases/login.use-case';
import { RegisterUseCase } from '../../../application/auth/use-cases/register.use-case';
import { RefreshTokenUseCase } from '../../../application/auth/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../../application/auth/use-cases/logout.use-case';
import { LoginResult } from '../../../application/auth/use-cases/login.use-case.dto';
import { RegisterResult } from '../../../application/auth/use-cases/register.use-case.dto';
import { RefreshTokenResult } from '../../../application/auth/use-cases/refresh-token.use-case.dto';

describe('AuthPresentationController', () => {
  let controller: AuthPresentationController;
  let loginUseCase: LoginUseCase;
  let registerUseCase: RegisterUseCase;
  let refreshTokenUseCase: RefreshTokenUseCase;
  let logoutUseCase: LogoutUseCase;

  const mockLoginUseCase = {
    execute: jest.fn(),
  };

  const mockRegisterUseCase = {
    execute: jest.fn(),
  };

  const mockRefreshTokenUseCase = {
    execute: jest.fn(),
  };

  const mockLogoutUseCase = {
    execute: jest.fn(),
  };

  const mockResponse: any = {
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  };

  const mockRequest: any = {
    cookies: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthPresentationController],
      providers: [
        {
          provide: LoginUseCase,
          useValue: mockLoginUseCase,
        },
        {
          provide: RegisterUseCase,
          useValue: mockRegisterUseCase,
        },
        {
          provide: RefreshTokenUseCase,
          useValue: mockRefreshTokenUseCase,
        },
        {
          provide: LogoutUseCase,
          useValue: mockLogoutUseCase,
        },
      ],
    }).compile();

    controller = module.get<AuthPresentationController>(AuthPresentationController);
    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    registerUseCase = module.get<RegisterUseCase>(RegisterUseCase);
    refreshTokenUseCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
    logoutUseCase = module.get<LogoutUseCase>(LogoutUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockRequest.cookies = {}; // Reset cookies for each test
  });

  describe('login', () => {
    it('should login user and set cookies', async () => {
      const loginDto = { identifier: 'testuser', password: 'password123' };
      const loginResult = new LoginResult('access-token', 'refresh-token', {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
        status: 'ACTIVE',
      });

      mockLoginUseCase.execute.mockResolvedValue(loginResult);

      const result = await controller.login(
        loginDto,
        mockResponse,
        '127.0.0.1',
        'test-agent'
      );

      expect(result.accessToken).toBe('access-token');
      expect(result.user.username).toBe('testuser');
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockLoginUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };

      const registerResult = new RegisterResult({
        id: '123',
        username: 'newuser',
        email: 'new@example.com',
        roles: ['user'],
        status: 'ACTIVE',
      });

      mockRegisterUseCase.execute.mockResolvedValue(registerResult);

      const result = await controller.register(registerDto);

      expect(result.message).toBe('User registered successfully');
      expect(result.user.username).toBe('newuser');
      expect(mockRegisterUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should refresh tokens and set new cookies', async () => {
      mockRequest.cookies = { refresh_token: 'old-refresh-token' };

      const refreshResult = new RefreshTokenResult('new-access-token', 'new-refresh-token');
      mockRefreshTokenUseCase.execute.mockResolvedValue(refreshResult);

      const result = await controller.refresh(mockRequest, mockResponse);

      expect(result.accessToken).toBe('new-access-token');
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockRefreshTokenUseCase.execute).toHaveBeenCalled();
    });

    it('should throw error when refresh token not found', async () => {
      mockRequest.cookies = {};

      await expect(controller.refresh(mockRequest, mockResponse)).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should logout user and clear cookies', async () => {
      mockRequest.cookies = { refresh_token: 'refresh-token' };
      mockLogoutUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.logout(mockRequest, mockResponse);

      expect(result.message).toBe('Logout successful');
      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(2);
      expect(mockLogoutUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUserRequest: any = {
        user: {
          id: '123',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['user'],
        },
      };

      const result = await controller.getProfile(mockUserRequest);

      expect(result.user).toEqual(mockUserRequest.user);
    });
  });
});
