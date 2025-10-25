import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  ILoginLogsService,
  LoginAttempt,
} from '../../../domain/interfaces/services/login-logs.interface';

@Injectable()
export class LoginLogsService implements ILoginLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async logAttempt(attempt: LoginAttempt): Promise<void> {
    await this.prisma.loginLog.create({
      data: {
        userId: attempt.userId,
        username: attempt.username,
        success: attempt.success,
        ipAddress: attempt.ipAddress,
        userAgent: attempt.userAgent,
        reason: attempt.reason,
      },
    });
  }

  async getRecentFailedAttempts(username: string, minutesAgo: number): Promise<number> {
    const since = new Date();
    since.setMinutes(since.getMinutes() - minutesAgo);

    const count = await this.prisma.loginLog.count({
      where: {
        username,
        success: false,
        timestamp: {
          gte: since,
        },
      },
    });

    return count;
  }
}
