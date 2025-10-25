import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ITokenService } from '../../../domain/interfaces/services/token-service.interface';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository.interface';
import { RefreshTokenCommand, RefreshTokenResult } from './refresh-token.use-case.dto';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly tokenService: ITokenService,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResult> {
    const { refreshToken } = command;

    // Find refresh token in database
    const storedToken = await this.tokenService.findRefreshToken(refreshToken);

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token is revoked
    const isRevoked = await this.tokenService.isTokenRevoked(refreshToken);
    if (isRevoked) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      // Remove expired token
      await this.tokenService.revokeRefreshToken(refreshToken);
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Verify token signature and get user info
    let tokenPayload;
    try {
      tokenPayload = await this.tokenService.verifyRefreshToken(refreshToken);
    } catch (error) {
      await this.tokenService.revokeRefreshToken(refreshToken);
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Get user to check status
    const user = await this.userRepository.findById(tokenPayload.sub);

    if (!user) {
      await this.tokenService.revokeRefreshToken(refreshToken);
      throw new UnauthorizedException('User not found');
    }

    if (!user.canLogin()) {
      await this.tokenService.revokeRefreshToken(refreshToken);
      throw new UnauthorizedException('User account is not active');
    }

    // Generate new tokens
    const newAccessToken = await this.tokenService.generateAccessToken({
      sub: user.id,
      username: user.username,
      roles: user.roles,
    });

    const newRefreshToken = await this.tokenService.generateRefreshToken(user.id);

    // Revoke old refresh token and save new one
    await this.tokenService.revokeRefreshToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    await this.tokenService.saveRefreshToken(user.id, newRefreshToken, expiresAt);

    return new RefreshTokenResult(newAccessToken, newRefreshToken);
  }
}
