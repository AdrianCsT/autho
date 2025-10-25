export interface TokenPayload {
  sub: string;
  username: string;
  roles: string[];
}

export interface RefreshTokenData {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface ITokenService {
  // Access token operations
  generateAccessToken(payload: TokenPayload): Promise<string>;
  verifyAccessToken(token: string): Promise<TokenPayload>;

  // Refresh token operations
  generateRefreshToken(userId: string): Promise<string>;
  verifyRefreshToken(token: string): Promise<TokenPayload>;
  
  // Refresh token persistence
  saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshTokenData>;
  findRefreshToken(token: string): Promise<RefreshTokenData | null>;
  isTokenRevoked(token: string): Promise<boolean>;
  revokeRefreshToken(token: string): Promise<void>;
  revokeAllUserRefreshTokens(userId: string): Promise<void>;
  revokeUserTokens(userId: string): Promise<void>;
}
