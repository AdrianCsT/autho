export class Password {
  private readonly value: string;

  private constructor(password: string) {
    this.value = password;
  }

  static create(password: string): Password {
    if (!password) {
      throw new Error('Password cannot be empty');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      throw new Error('Password must not exceed 128 characters');
    }

    // At least one letter and one number
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasLetter || !hasNumber) {
      throw new Error('Password must contain at least one letter and one number');
    }

    return new Password(password);
  }

  getValue(): string {
    return this.value;
  }
}
