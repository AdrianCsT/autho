import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { add } from 'date-fns';
import { UsersService } from '../users/users.service';
import { LoginLogsService, LoginLogData } from './services/login-logs.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaClient,
        private jwtService: JwtService,
        private usersService: UsersService,
        private config: ConfigService,
        private loginLogsService: LoginLogsService,
    ) { }

    async validateUser(identifier: string, password: string) {
        const user = await this.usersService.findByEmailOrUsername(identifier);
        if (!user) return null;
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;
        return user;
    }

    createAccessToken(payload: any) {
        const secret = this.config.get<string>('JWT_ACCESS_SECRET');
        const expiresIn = this.config.get<string>('ACCESS_TOKEN_EXPIRES_IN') || '15m';
        return this.jwtService.sign(payload, {
            secret,
            expiresIn
        } as any);
    }

    createRefreshToken(payload: any) {
        const secret = this.config.get<string>('JWT_REFRESH_SECRET');
        const expiresIn = this.config.get<string>('REFRESH_TOKEN_EXPIRES_IN') || '7d';
        return this.jwtService.sign(payload, {
            secret,
            expiresIn
        } as any);
    }

    async login(user: any, userAgent?: string, ipAddress?: string) {
        const payload = { sub: user.id, username: user.username, role: user.role.name };

        const accessToken = this.createAccessToken(payload);
        const refreshToken = this.createRefreshToken(payload);

        // store hashed refresh token with user agent and IP
        const hashed = await bcrypt.hash(refreshToken, 12);
        const expiresAt = add(new Date(), { days: 7 }); // adjust with env if needed
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: hashed,
                expiresAt,
                userAgent,
                ipAddress,
            },
        });

        // Log successful login
        await this.loginLogsService.logLogin({
            userId: user.id,
            userAgent,
            ipAddress,
            success: true
        });

        return { accessToken, refreshToken };
    }

    async logFailedLogin(userId: string, userAgent?: string, ipAddress?: string, reason?: string) {
        await this.loginLogsService.logLogin({
            userId,
            userAgent,
            ipAddress,
            success: false,
            reason
        });
    }

    async rotateRefreshToken(oldToken: string) {
        // verify signature first
        let decoded;
        try {
            decoded = this.jwtService.verify(oldToken, { secret: this.config.get('JWT_REFRESH_SECRET') });
        } catch (err) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        const userId = decoded.sub as string;

        // find stored refresh tokens for user and compare hash
        const tokens = await this.prisma.refreshToken.findMany({
            where: { userId, revoked: false },
            orderBy: { createdAt: 'desc' },
        });

        const match = await Promise.all(
            tokens.map(async t => ({ t, ok: await bcrypt.compare(oldToken, t.tokenHash) })),
        ).then(arr => arr.find(x => x.ok));

        if (!match) {
            // possible reuse — revoke all tokens for user
            await this.prisma.refreshToken.updateMany({
                where: { userId },
                data: { revoked: true },
            });
            throw new UnauthorizedException('Refresh token reuse detected');
        }

        // mark the matched token as revoked
        await this.prisma.refreshToken.update({
            where: { id: match.t.id },
            data: { revoked: true },
        });

        // issue new tokens
        const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
        if (!user) throw new UnauthorizedException('User not found');

        const payload = { sub: user.id, username: user.username, role: user.role.name };
        const newAccessToken = this.createAccessToken(payload);
        const newRefreshToken = this.createRefreshToken(payload);
        const newHash = await bcrypt.hash(newRefreshToken, 12);
        const expiresAt = add(new Date(), { days: 7 });

        await this.prisma.refreshToken.create({
            data: { userId: user.id, tokenHash: newHash, expiresAt },
        });

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }

    async logout(refreshToken: string) {
        try {
            const decoded = this.jwtService.verify(refreshToken, { secret: this.config.get('JWT_REFRESH_SECRET') });
            const userId = decoded.sub as string;

            // revoke all refresh tokens (you may revoke single instead)
            await this.prisma.refreshToken.updateMany({
                where: { userId },
                data: { revoked: true },
            });
        } catch (err) {
            // ignore
        }
    }
}
