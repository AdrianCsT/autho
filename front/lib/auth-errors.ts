export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export function handleAuthError(error: any): string {
  if (error instanceof AuthError) {
    return error.message;
  }

  if (error?.message) {
    return error.message;
  }

  // Handle backend error responses
  if (error?.statusCode === 401) {
    return 'Invalid credentials or session expired';
  }

  if (error?.statusCode === 403) {
    return 'Access denied';
  }

  return 'An unexpected error occurred';
}
