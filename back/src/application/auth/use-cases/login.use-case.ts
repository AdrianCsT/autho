import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository.interface';
import { IPasswordHasher } from '../../../domain/interfaces/services/password-hasher.interface';
import { ITokenService } from '../../../domain/interfaces/services/token-service.interface';
import { ILoginLogsService } from '../../../domain/interfaces/services/login-logs.interface';
import { LoginCommand, LoginResult } from './login.use-case.dto';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
    private readonly loginLogsService: ILoginLogsService,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    const { identifier, password, ipAddress, userAgent } = command;

    // Check for recent failed attempts
    const failedAttempts = await this.loginLogsService.getRecentFailedAttempts(
      identifier,
      LOCKOUT_DURATION_MINUTES,
    );

    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
      await this.loginLogsService.logAttempt({
        username: identifier,
        success: false,
        ipAddress,
        userAgent,
        reason: 'Account temporarily locked due to too many failed attempts',
      });

      throw new UnauthorizedException(
        `Too many failed login attempts. Please try again in ${LOCKOUT_DURATION_MINUTES} minutes.`,
      );
    }

    // Find user by username or email
    const user = await this.userRepository.findByUsernameOrEmail(identifier);

    if (!user) {
      await this.loginLogsService.logAttempt({
        username: identifier,
        success: false,
        ipAddress,
        userAgent,
        reason: 'User not found',
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.passwordHasher.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      await this.loginLogsService.logAttempt({
        userId: user.id,
        username: identifier,
        success: false,
        ipAddress,
        userAgent,
        reason: 'Invalid password',
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    // Check user status
    if (!user.canLogin()) {
      await this.loginLogsService.logAttempt({
        userId: user.id,
        username: identifier,
        success: false,
        ipAddress,
        userAgent,
        reason: `Account status: ${user.status}`,
      });

      if (user.isSuspended()) {
        throw new UnauthorizedException('Your account has been suspended. Please contact support.');
      }

      if (user.isInactive()) {
        throw new UnauthorizedException('Your account is inactive. Please contact an administrator.');
      }

      throw new UnauthorizedException('Unable to login at this time.');
    }

    // Generate tokens
    const tokenPayload = {
      sub: user.id,
      username: user.username,
      roles: user.roles,
    };

    const accessToken = await this.tokenService.generateAccessToken(tokenPayload);
    const refreshToken = await this.tokenService.generateRefreshToken(user.id);

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    await this.tokenService.saveRefreshToken(user.id, refreshToken, expiresAt);

    // Log successful login
    await this.loginLogsService.logAttempt({
      userId: user.id,
      username: identifier,
      success: true,
      ipAddress,
      userAgent,
    });

    return new LoginResult(accessToken, refreshToken, {
      id: user.id,
      username: user.username,
      email: user.email.getValue(),
      roles: user.roles,
      status: user.status,
    });
  }
}
