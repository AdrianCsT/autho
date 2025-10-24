import { Body, Controller, HttpCode, Post, Res, UseGuards, Get, Request, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from './constants';
import { LoginResponseDto, LogoutResponseDto, RefreshResponseDto, RefreshTokenDto } from './dtos/auth-response.dto';
import { LoginDto } from './dtos/login.dto';
import { 
  UnauthorizedErrorResponseDto, 
  ValidationErrorResponseDto,
  InternalServerErrorResponseDto 
} from '../common/dtos';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private usersService: UsersService) {}

  @ApiOperation({
    summary: 'User login',
    description: `Authenticate user with email/username and password. Returns JWT access token and sets HTTP-only cookies.
    
    **Usage Guidelines:**
    - Use either email address or username as the identifier
    - Password is case-sensitive and must match exactly
    - Successful login returns an access token valid for 15 minutes
    - HTTP-only cookies are set for enhanced security
    - Access token should be used in Authorization header as "Bearer <token>"
    - Only users with ACTIVE status can log in
    
    **Account Status Requirements:**
    - ACTIVE: User can log in normally
    - INACTIVE: Login denied - account is inactive
    - PENDING: Login denied - account is awaiting approval
    - SUSPENDED: Login denied - account has been suspended
    
    **Security Notes:**
    - Failed login attempts are logged for security monitoring
    - Account lockout may occur after multiple failed attempts
    - Use HTTPS in production to protect credentials`,
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful - user authenticated and tokens generated',
    type: LoginResponseDto,
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMWIyYzNkNC1lNWY2LTc4OTAtYWJjZC1lZjEyMzQ1Njc4OTAiLCJ1c2VybmFtZSI6ImpvaG5kb2UiLCJyb2xlcyI6WyJ1c2VyIl0sImlhdCI6MTcwMzE1NDAwMCwiZXhwIjoxNzAzMTU0OTAwfQ.example_signature'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
    type: ValidationErrorResponseDto,
    schema: {
      example: {
        statusCode: 400,
        message: [
          'identifier should not be empty',
          'password should not be empty'
        ],
        error: 'Bad Request',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/auth/login'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid credentials or account status issue',
    type: UnauthorizedErrorResponseDto,
    schema: {
      oneOf: [
        {
          description: 'Invalid credentials - wrong email/username or password',
          example: {
            statusCode: 401,
            message: 'Invalid credentials',
            error: 'Unauthorized',
            timestamp: '2023-12-01T10:00:00.000Z',
            path: '/auth/login'
          }
        },
        {
          description: 'Account is inactive',
          example: {
            statusCode: 401,
            message: 'Account is inactive. Please contact support.',
            error: 'Unauthorized',
            timestamp: '2023-12-01T10:00:00.000Z',
            path: '/auth/login'
          }
        },
        {
          description: 'Account is pending',
          example: {
            statusCode: 401,
            message: 'Account is pending. Please contact support.',
            error: 'Unauthorized',
            timestamp: '2023-12-01T10:00:00.000Z',
            path: '/auth/login'
          }
        },
        {
          description: 'Account is suspended',
          example: {
            statusCode: 401,
            message: 'Account is suspended. Please contact support.',
            error: 'Unauthorized',
            timestamp: '2023-12-01T10:00:00.000Z',
            path: '/auth/login'
          }
        }
      ]
    }
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: InternalServerErrorResponseDto,
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/auth/login'
      }
    }
  })
  @ApiBody({
    type: LoginDto,
    description: 'Login credentials with identifier (email or username) and password',
    examples: {
      email_login: {
        summary: 'Login with email',
        description: 'Authenticate using email address as identifier',
        value: {
          identifier: 'john.doe@example.com',
          password: 'MySecureP@ssw0rd123!'
        }
      },
      username_login: {
        summary: 'Login with username',
        description: 'Authenticate using username as identifier',
        value: {
          identifier: 'johndoe',
          password: 'MySecureP@ssw0rd123!'
        }
      },
      simple_login: {
        summary: 'Simple login example',
        description: 'Basic login with minimum requirements',
        value: {
          identifier: 'user@example.com',
          password: 'password123'
        }
      }
    }
  })
  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response, @Request() req: any) {
    const user = await this.usersService.findByEmailOrUsername(dto.identifier);
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    if (!user) {
      // Log failed attempt for non-existent user (create a dummy log without userId)
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await this.usersService.validatePassword(user.id, dto.password);
    if (!valid) {
      // Log failed password attempt
      await this.authService.logFailedLogin(user.id, userAgent, ipAddress, 'Invalid password');
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check user status
    if (user.status !== 'ACTIVE') {
      await this.authService.logFailedLogin(user.id, userAgent, ipAddress, `Account status: ${user.status}`);
      throw new UnauthorizedException(`Account is ${user.status.toLowerCase()}. Please contact support.`);
    }

    const tokens = await this.authService.login(user, userAgent, ipAddress);

    // Set access token cookie
    res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 15, // 15 minutes
      path: '/'
    });

    // Set refresh token cookie
    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return { 
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      message: 'Login successful.'
    };
  }

  @ApiOperation({
    summary: 'Refresh access token',
    description: `Generate new access and refresh tokens using a valid refresh token.
    
    **Usage Guidelines:**
    - Use this endpoint when your access token expires (after 15 minutes)
    - Provide the refresh token obtained from login or previous refresh
    - Both access and refresh tokens are rotated for security
    - Store the new refresh token securely for future use
    
    **Security Notes:**
    - Refresh tokens expire after 7 days of inactivity
    - Each refresh token can only be used once (token rotation)
    - Invalid or expired refresh tokens will result in 401 error`,
  })
  @ApiResponse({
    status: 201,
    description: 'Token refresh successful - new tokens generated',
    type: RefreshResponseDto,
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMWIyYzNkNC1lNWY2LTc4OTAtYWJjZC1lZjEyMzQ1Njc4OTAiLCJ1c2VybmFtZSI6ImpvaG5kb2UiLCJyb2xlcyI6WyJ1c2VyIl0sImlhdCI6MTcwMzE1NDkwMCwiZXhwIjoxNzAzMTU1ODAwfQ.new_signature',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMWIyYzNkNC1lNWY2LTc4OTAtYWJjZC1lZjEyMzQ1Njc4OTAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTcwMzE1NDkwMCwiZXhwIjoxNzAzNzU5NzAwfQ.new_refresh_signature'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - missing or invalid refresh token format',
    type: ValidationErrorResponseDto,
    schema: {
      example: {
        statusCode: 400,
        message: [
          'refreshToken should not be empty',
          'refreshToken must be a string'
        ],
        error: 'Bad Request',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/auth/refresh'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
    type: UnauthorizedErrorResponseDto,
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid or expired refresh token',
        error: 'Unauthorized',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/auth/refresh'
      }
    }
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: InternalServerErrorResponseDto,
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/auth/refresh'
      }
    }
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Refresh token for generating new access and refresh tokens',
    examples: {
      valid_refresh: {
        summary: 'Valid refresh token',
        description: 'Use a valid refresh token to get new tokens',
        value: {
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMWIyYzNkNC1lNWY2LTc4OTAtYWJjZC1lZjEyMzQ1Njc4OTAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTcwMzE1NDAwMCwiZXhwIjoxNzAzNzU4ODAwfQ.refresh_signature'
        }
      }
    }
  })
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const tokens = await this.authService.rotateRefreshToken(refreshTokenDto.refreshToken);
    return tokens;
  }

  @ApiOperation({
    summary: 'User logout',
    description: `Invalidate refresh token and clear authentication cookies.
    
    **Usage Guidelines:**
    - Provide the refresh token to invalidate the session
    - All HTTP-only cookies will be cleared automatically
    - Access tokens remain valid until expiration (15 minutes)
    - Recommended to call this endpoint when user explicitly logs out
    
    **Security Notes:**
    - Refresh token is permanently invalidated and cannot be reused
    - Client should discard any stored tokens after logout
    - Consider implementing client-side token cleanup`,
  })
  @ApiResponse({
    status: 201,
    description: 'Logout successful - session invalidated and cookies cleared',
    type: LogoutResponseDto,
    schema: {
      example: {
        ok: true
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - missing or invalid refresh token format',
    type: ValidationErrorResponseDto,
    schema: {
      example: {
        statusCode: 400,
        message: [
          'refreshToken should not be empty',
          'refreshToken must be a string'
        ],
        error: 'Bad Request',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/auth/logout'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
    type: UnauthorizedErrorResponseDto,
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid refresh token',
        error: 'Unauthorized',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/auth/logout'
      }
    }
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: InternalServerErrorResponseDto,
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/auth/logout'
      }
    }
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Refresh token to invalidate during logout',
    examples: {
      logout_token: {
        summary: 'Logout with refresh token',
        description: 'Provide refresh token to invalidate session',
        value: {
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMWIyYzNkNC1lNWY2LTc4OTAtYWJjZC1lZjEyMzQ1Njc4OTAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTcwMzE1NDAwMCwiZXhwIjoxNzAzNzU4ODAwfQ.refresh_signature'
        }
      }
    }
  })
  @Post('logout')
  async logout(@Body() refreshTokenDto: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(refreshTokenDto.refreshToken);
    res.clearCookie(ACCESS_TOKEN_COOKIE);
    res.clearCookie(REFRESH_TOKEN_COOKIE);
    return { ok: true };
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Verify JWT token',
    description: `Verifies the validity of the provided JWT token and returns user information.
    
    **Usage Guidelines:**
    - Include JWT token in Authorization header as "Bearer <token>"
    - Use this endpoint to validate tokens before making API calls
    - Returns user information if token is valid and not expired
    - Useful for client-side authentication state management
    
    **Authentication Required:**
    - Valid JWT access token in Authorization header
    - Token must not be expired (15-minute lifetime)
    - Token must be properly formatted and signed`,
  })
  @ApiResponse({
    status: 200,
    description: 'Token is valid - user information returned',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean', example: true },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
            username: { type: 'string', example: 'johndoe' },
            roles: {
              type: 'array',
              items: { type: 'string' },
              example: ['user']
            }
          }
        }
      },
      example: {
        valid: true,
        user: {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          username: 'johndoe',
          roles: ['user']
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
    type: UnauthorizedErrorResponseDto,
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/auth/verify'
      }
    }
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: InternalServerErrorResponseDto,
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/auth/verify'
      }
    }
  })
  async verifyToken(@Request() req: any) {
    return {
      valid: true,
      user: req.user
    };
  }
}
