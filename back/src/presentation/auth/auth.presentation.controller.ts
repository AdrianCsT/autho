import { 
  Body, 
  Controller, 
  HttpCode, 
  Post, 
  Res, 
  UseGuards, 
  Get, 
  Request as NestRequest,
  Ip,
  Headers,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { LoginUseCase } from '../../application/auth/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/auth/use-cases/register.use-case';
import { RefreshTokenUseCase } from '../../application/auth/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/auth/use-cases/logout.use-case';
import { LoginCommand } from '../../application/auth/use-cases/login.use-case.dto';
import { RegisterCommand } from '../../application/auth/use-cases/register.use-case.dto';
import { RefreshTokenCommand } from '../../application/auth/use-cases/refresh-token.use-case.dto';
import { LogoutCommand } from '../../application/auth/use-cases/logout.use-case.dto';
import { LoginDto } from '../../auth/dtos/login.dto';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../../auth/constants';

@ApiTags('Authentication')
@Controller('auth')
export class AuthPresentationController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    const command = new LoginCommand(
      loginDto.identifier,
      loginDto.password,
      ip,
      userAgent,
    );

    const result = await this.loginUseCase.execute(command);

    // Set HTTP-only cookies
    response.cookie(ACCESS_TOKEN_COOKIE, result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Username or email already exists' })
  @HttpCode(201)
  @Post('register')
  async register(@Body() registerDto: { username: string; email: string; password: string }) {
    const command = new RegisterCommand(
      registerDto.username,
      registerDto.email,
      registerDto.password,
    );

    const result = await this.registerUseCase.execute(command);

    return {
      message: 'User registered successfully',
      user: result.user,
    };
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @HttpCode(200)
  @Post('refresh')
  async refresh(
    @NestRequest() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    const command = new RefreshTokenCommand(refreshToken);
    const result = await this.refreshTokenUseCase.execute(command);

    // Set new cookies
    response.cookie(ACCESS_TOKEN_COOKIE, result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    response.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Token refreshed successfully',
      accessToken: result.accessToken,
    };
  }

  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('logout')
  async logout(
    @NestRequest() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE];
    
    if (refreshToken) {
      const command = new LogoutCommand(refreshToken);
      await this.logoutUseCase.execute(command);
    }

    // Clear cookies
    response.clearCookie(ACCESS_TOKEN_COOKIE);
    response.clearCookie(REFRESH_TOKEN_COOKIE);

    return {
      message: 'Logout successful',
    };
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@NestRequest() request: Request) {
    return {
      user: (request as any).user,
    };
  }
}
