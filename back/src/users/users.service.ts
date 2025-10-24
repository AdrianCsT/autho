import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dtos/update-user.dto';
import { GetUsersQueryDto } from './dtos/get-users-query.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaClient) {}

  async createUser(username: string, email: string, password: string) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existing) throw new ConflictException('Username or email already in use');

    const passwordHash = await bcrypt.hash(password, 12);

    // Get or create the default 'user' role
    const userRole = await this.prisma.role.upsert({
      where: { name: 'user' },
      update: {},
      create: { name: 'user' },
    });

    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        roleId: userRole.id,
      },
      include: { role: true },
    });
    return { 
      id: user.id, 
      username: user.username, 
      email: user.email,
      role: user.role.name 
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmailOrUsername(identifier: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
      include: { role: true },
    });
  }

  async validatePassword(userId: string, plain: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;
    return bcrypt.compare(plain, user.passwordHash);
  }

  async updateUser(id: string, updateData: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Check for conflicts if username or email is being updated
    if (updateData.username || updateData.email) {
      const existing = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                updateData.username ? { username: updateData.username } : {},
                updateData.email ? { email: updateData.email } : {}
              ].filter(condition => Object.keys(condition).length > 0)
            }
          ]
        }
      });
      if (existing) throw new ConflictException('Username or email already in use');
    }

    const updatePayload: any = {};
    
    if (updateData.username) updatePayload.username = updateData.username;
    if (updateData.email) updatePayload.email = updateData.email;
    if (updateData.status) updatePayload.status = updateData.status;
    if (updateData.password) {
      updatePayload.passwordHash = await bcrypt.hash(updateData.password, 12);
    }

    // Handle role update (single role)
    if (updateData.role) {
      const role = await this.prisma.role.upsert({
        where: { name: updateData.role },
        update: {},
        create: { name: updateData.role },
      });
      updatePayload.roleId = role.id;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updatePayload,
      include: { role: true }
    });

    return {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      status: updatedUser.status,
      role: updatedUser.role.name,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }

  async getUsers(query: GetUsersQueryDto) {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { username: { contains: search } },
        { email: { contains: search } }
      ];
    }
    
    if (status) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: { role: true },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.user.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        status: user.status,
        role: user.role.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  // assign role (simple helper)
  async addRoleToUser(userId: string, roleName: string) {
    // ensure role exists
    const role = await this.prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: { roleId: role.id },
    });
  }
}
