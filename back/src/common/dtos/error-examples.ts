/**
 * Comprehensive error response examples for API documentation
 * These examples demonstrate the structure and content of error responses
 * that can be returned by various endpoints in the application.
 */

export const ErrorExamples = {
    // Authentication Errors
    INVALID_CREDENTIALS: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/auth/login'
    },

    INVALID_TOKEN: {
        statusCode: 401,
        message: 'Invalid or expired token',
        error: 'Unauthorized',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/auth/verify'
    },

    MISSING_TOKEN: {
        statusCode: 401,
        message: 'No authorization token was found',
        error: 'Unauthorized',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/users/profile'
    },

    // Validation Errors
    LOGIN_VALIDATION: {
        statusCode: 400,
        message: [
            'identifier should not be empty',
            'password should not be empty'
        ],
        error: 'Bad Request',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/auth/login'
    },

    REGISTRATION_VALIDATION: {
        statusCode: 400,
        message: [
            'username should not be empty',
            'username must be a string',
            'email must be an email',
            'password must be longer than or equal to 8 characters',
            'password must be shorter than or equal to 128 characters'
        ],
        error: 'Bad Request',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/users/register'
    },

    REFRESH_TOKEN_VALIDATION: {
        statusCode: 400,
        message: [
            'refreshToken should not be empty',
            'refreshToken must be a string'
        ],
        error: 'Bad Request',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/auth/refresh'
    },

    // Conflict Errors
    USER_ALREADY_EXISTS: {
        statusCode: 409,
        message: 'Username or email already exists',
        error: 'Conflict',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/users/register'
    },

    EMAIL_ALREADY_EXISTS: {
        statusCode: 409,
        message: 'Email address is already registered',
        error: 'Conflict',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/users/register'
    },

    USERNAME_ALREADY_EXISTS: {
        statusCode: 409,
        message: 'Username is already taken',
        error: 'Conflict',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/users/register'
    },

    // Not Found Errors
    USER_NOT_FOUND: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/users/profile'
    },

    ENDPOINT_NOT_FOUND: {
        statusCode: 404,
        message: 'Cannot GET /api/nonexistent',
        error: 'Not Found',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/api/nonexistent'
    },

    // Server Errors
    INTERNAL_SERVER_ERROR: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/auth/login'
    },

    DATABASE_CONNECTION_ERROR: {
        statusCode: 500,
        message: 'Database connection failed',
        error: 'Internal Server Error',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/users/register'
    },

    // Detailed validation error with field-specific information
    DETAILED_VALIDATION_ERROR: {
        statusCode: 400,
        message: [
            'email must be an email',
            'password must be longer than or equal to 8 characters'
        ],
        error: 'Bad Request',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/users/register',
        details: [
            {
                field: 'email',
                value: 'invalid-email',
                constraints: {
                    isEmail: 'email must be an email'
                }
            },
            {
                field: 'password',
                value: '123',
                constraints: {
                    minLength: 'password must be longer than or equal to 8 characters'
                }
            }
        ]
    }
};

/**
 * Common validation error messages for different field types
 */
export const ValidationMessages = {
    REQUIRED_FIELD: (field: string) => `${field} should not be empty`,
    INVALID_EMAIL: 'email must be an email',
    PASSWORD_TOO_SHORT: 'password must be longer than or equal to 8 characters',
    PASSWORD_TOO_LONG: 'password must be shorter than or equal to 128 characters',
    INVALID_STRING: (field: string) => `${field} must be a string`,
    INVALID_NUMBER: (field: string) => `${field} must be a number`,
    INVALID_BOOLEAN: (field: string) => `${field} must be a boolean`,
    INVALID_DATE: (field: string) => `${field} must be a valid date`,
    INVALID_UUID: (field: string) => `${field} must be a valid UUID`,
    INVALID_URL: (field: string) => `${field} must be a valid URL`,
    INVALID_PHONE: (field: string) => `${field} must be a valid phone number`,
    INVALID_LENGTH: (field: string, min: number, max: number) =>
        `${field} must be between ${min} and ${max} characters`,
    INVALID_RANGE: (field: string, min: number, max: number) =>
        `${field} must be between ${min} and ${max}`,
    INVALID_ENUM: (field: string, values: string[]) =>
        `${field} must be one of: ${values.join(', ')}`
};