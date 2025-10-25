export class RefreshTokenCommand {
  constructor(public readonly refreshToken: string) {}
}

export class RefreshTokenResult {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
  ) {}
}
