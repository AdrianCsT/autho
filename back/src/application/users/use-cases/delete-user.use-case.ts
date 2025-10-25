import { Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository.interface';
import { ITokenService } from '../../../domain/interfaces/services/token-service.interface';
import { DeleteUserCommand } from './delete-user.use-case.dto';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const { userId } = command;

    // Check if user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Revoke all refresh tokens
    await this.tokenService.revokeAllUserRefreshTokens(userId);

    // Delete user
    await this.userRepository.delete(userId);
  }
}
