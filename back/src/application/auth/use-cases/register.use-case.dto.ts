export class RegisterCommand {
  constructor(
    public readonly username: string,
    public readonly email: string,
    public readonly password: string,
  ) {}
}

export class RegisterResult {
  constructor(
    public readonly user: {
      id: string;
      username: string;
      email: string;
      roles: string[];
      status: string;
    },
  ) {}
}
