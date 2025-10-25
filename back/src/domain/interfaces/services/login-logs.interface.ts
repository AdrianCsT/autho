export interface LoginAttempt {
  userId?: string;
  username: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
}

export interface ILoginLogsService {
  logAttempt(attempt: LoginAttempt): Promise<void>;
  getRecentFailedAttempts(username: string, minutesAgo: number): Promise<number>;
}
