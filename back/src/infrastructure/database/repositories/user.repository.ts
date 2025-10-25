import { Injectable } from '@nestjs/common';
import { User as PrismaUser, UserRole as PrismaUserRole } from '@prisma/client';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository.interface';
import { UserEntity, UserStatus } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { PrismaService } from '../prisma.service';

type PrismaUserWithRoles = PrismaUser & { roles: PrismaUserRole[] };

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaUser: PrismaUserWithRoles): UserEntity {
    return UserEntity.reconstitute({
      id: prismaUser.id,
      username: prismaUser.username,
      email: Email.create(prismaUser.email),
      passwordHash: prismaUser.passwordHash,
      roles: prismaUser.roles.map(r => r.role),
      status: prismaUser.status as UserStatus,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  private includeRoles() {
    return {
      roles: true,
    };
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: this.includeRoles(),
    });

    return user ? this.toDomain(user) : null;
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: this.includeRoles(),
    });

    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: this.includeRoles(),
    });

    return user ? this.toDomain(user) : null;
  }

  async findByUsernameOrEmail(identifier: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
        ],
      },
      include: this.includeRoles(),
    });

    return user ? this.toDomain(user) : null;
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      include: this.includeRoles(),
    });

    return users.map(user => this.toDomain(user));
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const persistence = user.toPersistence();
    const roles = user.roles;

    const createdUser = await this.prisma.user.create({
      data: {
        username: persistence.username,
        email: persistence.email,
        passwordHash: persistence.passwordHash,
        status: persistence.status,
        roles: {
          create: roles.map(role => ({ role })),
        },
      },
      include: this.includeRoles(),
    });

    return this.toDomain(createdUser);
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const persistence = user.toPersistence();
    const roles = user.roles;

    // Delete existing roles and create new ones
    await this.prisma.userRole.deleteMany({
      where: { userId: user.id },
    });

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        username: persistence.username,
        email: persistence.email,
        passwordHash: persistence.passwordHash,
        status: persistence.status,
        updatedAt: persistence.updatedAt,
        roles: {
          create: roles.map(role => ({ role })),
        },
      },
      include: this.includeRoles(),
    });

    return this.toDomain(updatedUser);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { username },
    });
    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email },
    });
    return count > 0;
  }
}
