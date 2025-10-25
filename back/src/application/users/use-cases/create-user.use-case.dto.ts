export class CreateUserCommand {
  constructor(
    public readonly username: string,
    public readonly email: string,
    public readonly password: string,
    public readonly roles: string[],
    public readonly status: string,
  ) {}
}

export class CreateUserResult {
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
