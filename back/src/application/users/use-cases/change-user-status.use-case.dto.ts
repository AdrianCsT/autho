export class ChangeUserStatusCommand {
  constructor(
    public readonly userId: string,
    public readonly status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
  ) {}
}

export class ChangeUserStatusResult {
  constructor(
    public readonly user: {
      id: string;
      username: string;
      status: string;
    },
  ) {}
}
