import { Injectable } from '@nestjs/common';
import { ITokenService } from '../../../domain/interfaces/services/token-service.interface';
import { LogoutCommand } from './logout.use-case.dto';

@Injectable()
export class LogoutUseCase {
  constructor(private readonly tokenService: ITokenService) {}

  async execute(command: LogoutCommand): Promise<void> {
    const { refreshToken } = command;

    if (!refreshToken) {
      return; // Nothing to logout
    }

    try {
      await this.tokenService.revokeRefreshToken(refreshToken);
    } catch (error) {
      // Token might not exist or already revoked - that's fine
    }
  }
}
