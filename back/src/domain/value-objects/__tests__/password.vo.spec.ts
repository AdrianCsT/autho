import { Password } from '../../value-objects/password.vo';

describe('Password Value Object', () => {
  describe('create', () => {
    it('should create password with valid format', () => {
      const password = Password.create('Test1234');
      expect(password.getValue()).toBe('Test1234');
    });

    it('should throw error for empty password', () => {
      expect(() => Password.create('')).toThrow('Password cannot be empty');
    });

    it('should throw error for password less than 8 characters', () => {
      expect(() => Password.create('Test12')).toThrow('Password must be at least 8 characters long');
    });

    it('should throw error for password more than 128 characters', () => {
      const longPassword = 'a'.repeat(129);
      expect(() => Password.create(longPassword)).toThrow('Password must not exceed 128 characters');
    });

    it('should throw error for password without letters', () => {
      expect(() => Password.create('12345678')).toThrow('Password must contain at least one letter and one number');
    });

    it('should throw error for password without numbers', () => {
      expect(() => Password.create('abcdefgh')).toThrow('Password must contain at least one letter and one number');
    });

    it('should accept password with letters and numbers', () => {
      const validPasswords = [
        'Test1234',
        'MyP@ssw0rd',
        '12345abc',
        'Secure123!',
        'p4ssword',
      ];

      validPasswords.forEach((pwd) => {
        expect(() => Password.create(pwd)).not.toThrow();
      });
    });

    it('should accept password with exactly 8 characters', () => {
      expect(() => Password.create('Test1234')).not.toThrow();
    });

    it('should accept password with exactly 128 characters', () => {
      const password = 'a'.repeat(127) + '1';
      expect(() => Password.create(password)).not.toThrow();
    });

    it('should accept password with special characters', () => {
      const passwords = [
        'P@ssw0rd!',
        'Test#123',
        'My$ecure1',
      ];

      passwords.forEach((pwd) => {
        expect(() => Password.create(pwd)).not.toThrow();
      });
    });
  });

  describe('getValue', () => {
    it('should return password value', () => {
      const password = Password.create('Test1234');
      expect(password.getValue()).toBe('Test1234');
    });

    it('should not modify password value', () => {
      const originalPassword = 'MyP@ssw0rd1';
      const password = Password.create(originalPassword);
      expect(password.getValue()).toBe(originalPassword);
    });
  });
});
