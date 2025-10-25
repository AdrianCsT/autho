import { Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository.interface';
import { ITokenService } from '../../../domain/interfaces/services/token-service.interface';
import { ChangeUserStatusCommand, ChangeUserStatusResult } from './change-user-status.use-case.dto';

@Injectable()
export class ChangeUserStatusUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(command: ChangeUserStatusCommand): Promise<ChangeUserStatusResult> {
    const { userId, status } = command;

    // Find user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Change status based on command
    switch (status) {
      case 'ACTIVE':
        user.activate();
        break;
      case 'INACTIVE':
        user.deactivate();
        // Revoke all refresh tokens when deactivating
        await this.tokenService.revokeAllUserRefreshTokens(userId);
        break;
      case 'SUSPENDED':
        user.suspend();
        // Revoke all refresh tokens when suspending
        await this.tokenService.revokeAllUserRefreshTokens(userId);
        break;
    }

    // Save updated user
    const updatedUser = await this.userRepository.update(user);

    return new ChangeUserStatusResult({
      id: updatedUser.id,
      username: updatedUser.username,
      status: updatedUser.status,
    });
  }
}
