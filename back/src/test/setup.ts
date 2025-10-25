// Test setup file
// Add any global test configurations here

// Mock environment variables for testing
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-32-chars';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-32-chars';
process.env.JWT_ACCESS_EXPIRATION = '15m';
process.env.JWT_REFRESH_EXPIRATION = '7d';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
