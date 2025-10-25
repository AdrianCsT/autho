import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository.interface';
import { IPasswordHasher } from '../../../domain/interfaces/services/password-hasher.interface';
import { UserEntity, UserStatus } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { Password } from '../../../domain/value-objects/password.vo';
import { CreateUserCommand, CreateUserResult } from './create-user.use-case.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResult> {
    const { username, email, password, roles, status } = command;

    // Validate email and password using value objects
    const emailVO = Email.create(email);
    Password.create(password); // Validates password format

    // Validate status
    if (!Object.values(UserStatus).includes(status as UserStatus)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    // Check if username already exists
    const existingUsername = await this.userRepository.existsByUsername(username);
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // Check if email already exists
    const existingEmail = await this.userRepository.existsByEmail(email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const passwordHash = await this.passwordHasher.hash(password);

    // Create user entity
    const user = UserEntity.create({
      username,
      email: emailVO,
      passwordHash,
      roles,
      status: status as UserStatus,
    });

    // Save user
    const savedUser = await this.userRepository.create(user);

    return new CreateUserResult({
      id: savedUser.id,
      username: savedUser.username,
      email: savedUser.email.getValue(),
      roles: savedUser.roles,
      status: savedUser.status,
    });
  }
}
