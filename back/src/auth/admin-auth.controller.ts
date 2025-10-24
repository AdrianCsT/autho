import { Controller, Get, Post, Body, Query, UseGuards, ForbiddenException, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginLogsService } from './services/login-logs.service';
import { SystemConfigService } from '../common/services/system-config.service';

@ApiTags('Admin - Authentication')
@Controller('admin/auth')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('bearer')
export class AdminAuthController {
  constructor(
    private loginLogsService: LoginLogsService,
    private systemConfigService: SystemConfigService,
  ) {}

  private checkAdminRole(user: any) {
    if (!user.role || user.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Get('login-logs')
  @ApiOperation({
    summary: 'Get login logs (Admin only)',
    description: 'Retrieve paginated login logs with user information. Only accessible by admin users.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 50)' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by specific user ID' })
  @ApiResponse({
    status: 200,
    description: 'Login logs retrieved successfully',
    schema: {
      example: {
        logs: [
          {
            id: 'log-uuid',
            userId: 'user-uuid',
            userAgent: 'Mozilla/5.0...',
            ipAddress: '192.168.1.1',
            success: true,
            reason: null,
            loginAt: '2023-12-01T10:00:00.000Z',
            user: {
              id: 'user-uuid',
              username: 'johndoe',
              email: 'john@example.com'
            }
          }
        ],
        total: 100,
        page: 1,
        limit: 50,
        totalPages: 2,
        hasNext: true,
        hasPrev: false
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getLoginLogs(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('userId') userId?: string
  ) {
    this.checkAdminRole(req.user);
    return this.loginLogsService.getLoginLogs(page, limit, userId);
  }

  @Get('active-sessions')
  @ApiOperation({
    summary: 'Get active sessions summary (Admin only)',
    description: 'Get summary of active sessions across all users.'
  })
  @ApiResponse({
    status: 200,
    description: 'Active sessions summary retrieved successfully',
    schema: {
      example: {
        totalActiveSessions: 25,
        usersWithActiveSessions: 12
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getActiveSessionsSummary(@Request() req: any) {
    this.checkAdminRole(req.user);
    
    // This would require a more complex query, but here's a basic implementation
    const totalActiveSessions = await this.systemConfigService['prisma'].refreshToken.count({
      where: {
        revoked: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    const usersWithActiveSessions = await this.systemConfigService['prisma'].refreshToken.groupBy({
      by: ['userId'],
      where: {
        revoked: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    return {
      totalActiveSessions,
      usersWithActiveSessions: usersWithActiveSessions.length
    };
  }
}