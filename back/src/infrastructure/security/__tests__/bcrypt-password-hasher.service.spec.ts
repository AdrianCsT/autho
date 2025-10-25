import { BcryptPasswordHasher } from '../bcrypt-password-hasher.service';
import * as bcrypt from 'bcryptjs';

// Mock bcryptjs
jest.mock('bcryptjs');

describe('BcryptPasswordHasher', () => {
  let service: BcryptPasswordHasher;

  beforeEach(() => {
    service = new BcryptPasswordHasher();
    jest.clearAllMocks();
  });

  describe('hash', () => {
    it('should hash a password', async () => {
      const password = 'mypassword123';
      const hashedPassword = 'hashedPassword';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.hash(password);

      expect(result).toBe(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });

    it('should use 10 salt rounds', async () => {
      await service.hash('password');

      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    });
  });

  describe('compare', () => {
    it('should return true when passwords match', async () => {
      const password = 'mypassword123';
      const hash = 'hashedPassword';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.compare(password, hash);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
    });

    it('should return false when passwords do not match', async () => {
      const password = 'wrongpassword';
      const hash = 'hashedPassword';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.compare(password, hash);

      expect(result).toBe(false);
    });
  });
});
