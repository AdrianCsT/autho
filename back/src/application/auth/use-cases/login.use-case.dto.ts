export class LoginCommand {
  constructor(
    public readonly identifier: string,
    public readonly password: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
  ) {}
}

export class LoginResult {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly user: {
      id: string;
      username: string;
      email: string;
      roles: string[];
      status: string;
    },
  ) {}
}
