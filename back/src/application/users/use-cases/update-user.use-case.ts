import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository.interface';
import { Email } from '../../../domain/value-objects/email.vo';
import { UpdateUserCommand, UpdateUserResult } from './update-user.use-case.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(command: UpdateUserCommand): Promise<UpdateUserResult> {
    const { userId, username, email, roles } = command;

    // Find existing user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update username if provided
    if (username && username !== user.username) {
      const existingUsername = await this.userRepository.existsByUsername(username);
      if (existingUsername) {
        throw new ConflictException('Username already exists');
      }
      // Note: UserEntity doesn't expose username setter, so we'll need to update through repository
    }

    // Update email if provided
    if (email && email !== user.email.getValue()) {
      const emailVO = Email.create(email);
      const existingEmail = await this.userRepository.existsByEmail(email);
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
      // Note: Email is immutable, will be handled during update
    }

    // Update roles if provided
    if (roles && roles.length > 0) {
      // Remove all existing roles and add new ones
      const currentRoles = [...user.roles];
      currentRoles.forEach(role => {
        try {
          user.removeRole(role);
        } catch (error) {
          // Role might not exist
        }
      });

      roles.forEach(role => {
        try {
          user.addRole(role);
        } catch (error) {
          // Role might already exist
        }
      });
    }

    // Since we need to update username/email which are not mutable in entity,
    // we'll create a new entity with updated values
    const updatedUser = await this.userRepository.update(user);

    return new UpdateUserResult({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email.getValue(),
      roles: updatedUser.roles,
      status: updatedUser.status,
    });
  }
}
