export class UpdateUserCommand {
  constructor(
    public readonly userId: string,
    public readonly username?: string,
    public readonly email?: string,
    public readonly roles?: string[],
  ) {}
}

export class UpdateUserResult {
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
