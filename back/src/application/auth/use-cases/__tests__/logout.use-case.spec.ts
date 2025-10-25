import { LogoutUseCase } from '../logout.use-case';
import { LogoutCommand } from '../logout.use-case.dto';
import { ITokenService } from '../../../../domain/interfaces/services/token-service.interface';

describe('LogoutUseCase', () => {
  let logoutUseCase: LogoutUseCase;
  let mockTokenService: jest.Mocked<ITokenService>;

  beforeEach(() => {
    mockTokenService = {
      revokeRefreshToken: jest.fn(),
    } as any;

    logoutUseCase = new LogoutUseCase(mockTokenService);
  });

  describe('successful logout', () => {
    it('should revoke refresh token', async () => {
      const command = new LogoutCommand('valid-refresh-token');

      mockTokenService.revokeRefreshToken.mockResolvedValue();

      await logoutUseCase.execute(command);

      expect(mockTokenService.revokeRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
    });

    it('should handle errors gracefully', async () => {
      const command = new LogoutCommand('invalid-token');

      mockTokenService.revokeRefreshToken.mockRejectedValue(new Error('Token not found'));

      // Should not throw, logout should be graceful
      await expect(logoutUseCase.execute(command)).resolves.not.toThrow();
    });

    it('should not throw when revoking already revoked token', async () => {
      const command = new LogoutCommand('already-revoked-token');

      mockTokenService.revokeRefreshToken.mockRejectedValue(new Error('Token already revoked'));

      await expect(logoutUseCase.execute(command)).resolves.not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle null token gracefully', async () => {
      const command = new LogoutCommand(null);

      await expect(logoutUseCase.execute(command)).resolves.not.toThrow();
    });

    it('should handle empty token gracefully', async () => {
      const command = new LogoutCommand('');

      await expect(logoutUseCase.execute(command)).resolves.not.toThrow();
    });
  });
});
