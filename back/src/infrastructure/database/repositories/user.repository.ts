import { Injectable } from '@nestjs/common';
import { User as PrismaUser, Role as PrismaRole } from '@prisma/client';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository.interface';
import { UserEntity, UserStatus } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { PrismaService } from '../prisma.service';

type PrismaUserWithRole = PrismaUser & { role: PrismaRole };

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaUser: PrismaUserWithRole): UserEntity {
    return UserEntity.reconstitute({
      id: prismaUser.id,
      username: prismaUser.username,
      email: Email.create(prismaUser.email),
      passwordHash: prismaUser.passwordHash,
      roles: [prismaUser.role.name],
      status: prismaUser.status as UserStatus,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  private includeRole() {
    return {
      role: true,
    };
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: this.includeRole(),
    });

    return user ? this.toDomain(user) : null;
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: this.includeRole(),
    });

    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: this.includeRole(),
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
      include: this.includeRole(),
    });

    return user ? this.toDomain(user) : null;
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      include: this.includeRole(),
    });

    return users.map((user: PrismaUserWithRole) => this.toDomain(user));
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const persistence = user.toPersistence();
    const roleName = user.roles[0]; // Get first role name

    // Find the role by name
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }

    const createdUser = await this.prisma.user.create({
      data: {
        username: persistence.username,
        email: persistence.email,
        passwordHash: persistence.passwordHash,
        status: persistence.status,
        roleId: role.id,
      },
      include: this.includeRole(),
    });

    return this.toDomain(createdUser);
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const persistence = user.toPersistence();
    const roleName = user.roles[0]; // Get first role name

    // Find the role by name
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        username: persistence.username,
        email: persistence.email,
        passwordHash: persistence.passwordHash,
        status: persistence.status,
        updatedAt: persistence.updatedAt,
        roleId: role.id,
      },
      include: this.includeRole(),
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
