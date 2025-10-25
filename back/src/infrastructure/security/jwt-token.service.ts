import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ITokenService,
  TokenPayload,
  RefreshTokenData,
} from '../../domain/interfaces/services/token-service.interface';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class JwtTokenService implements ITokenService {
  private readonly accessTokenSecret: string;
  private readonly accessTokenExpiration: string;
  private readonly refreshTokenSecret: string;
  private readonly refreshTokenExpiration: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.accessTokenSecret = this.configService.get<string>('JWT_ACCESS_SECRET') || 'access-secret';
    this.accessTokenExpiration = this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m';
    this.refreshTokenSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret';
    this.refreshTokenExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
  }

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.sign(payload, {
      secret: this.accessTokenSecret,
      expiresIn: this.accessTokenExpiration as any,
    });
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.accessTokenSecret,
      });
      return {
        sub: payload.sub,
        username: payload.username,
        roles: payload.roles,
      };
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  async generateRefreshToken(userId: string): Promise<string> {
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: this.refreshTokenSecret,
        expiresIn: this.refreshTokenExpiration as any,
      },
    );
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.refreshTokenSecret,
      });
      
      // For refresh tokens, we need to fetch the user to get full payload
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        sub: user.id,
        username: user.username,
        roles: [user.role.name],
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshTokenData> {
    const refreshToken = await this.prisma.refreshToken.create({
      data: {
        tokenHash: token, // Store the token hash
        userId,
        expiresAt,
      },
    });

    return {
      id: refreshToken.id,
      token: refreshToken.tokenHash,
      userId: refreshToken.userId,
      expiresAt: refreshToken.expiresAt,
      createdAt: refreshToken.createdAt,
    };
  }

  async findRefreshToken(token: string): Promise<RefreshTokenData | null> {
    const refreshToken = await this.prisma.refreshToken.findFirst({
      where: { tokenHash: token },
    });

    if (!refreshToken) {
      return null;
    }

    return {
      id: refreshToken.id,
      token: refreshToken.tokenHash,
      userId: refreshToken.userId,
      expiresAt: refreshToken.expiresAt,
      createdAt: refreshToken.createdAt,
    };
  }

  async isTokenRevoked(token: string): Promise<boolean> {
    const refreshToken = await this.prisma.refreshToken.findFirst({
      where: { tokenHash: token },
    });

    return refreshToken ? refreshToken.revoked : true;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: token },
      data: { revoked: true },
    });
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }

  async revokeUserTokens(userId: string): Promise<void> {
    return this.revokeAllUserRefreshTokens(userId);
  }
}
