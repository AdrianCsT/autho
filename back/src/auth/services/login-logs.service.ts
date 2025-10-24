import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface LoginLogData {
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  success: boolean;
  reason?: string;
}

@Injectable()
export class LoginLogsService {
  constructor(private prisma: PrismaClient) {}

  async logLogin(data: LoginLogData): Promise<void> {
    await this.prisma.loginLog.create({
      data: {
        userId: data.userId,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        success: data.success,
        reason: data.reason
      }
    });
  }

  async getLoginLogs(page = 1, limit = 50, userId?: string) {
    const skip = (page - 1) * limit;
    const where = userId ? { userId } : {};

    const [logs, total] = await Promise.all([
      this.prisma.loginLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        },
        orderBy: { loginAt: 'desc' }
      }),
      this.prisma.loginLog.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      logs,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  async getRecentFailedAttempts(userId: string, minutes = 15): Promise<number> {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    
    return this.prisma.loginLog.count({
      where: {
        userId,
        success: false,
        loginAt: {
          gte: since
        }
      }
    });
  }
}