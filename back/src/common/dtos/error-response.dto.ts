import { ApiProperty } from '@nestjs/swagger';

/**
 * Base error response structure following NestJS standard format
 */
export class BaseErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Timestamp when the error occurred',
    example: '2023-12-01T10:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Request path that caused the error',
    example: '/api/users/register',
  })
  path: string;
}

/**
 * 400 Bad Request - Validation errors
 */
export class BadRequestErrorResponseDto extends BaseErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: 400;

  @ApiProperty({
    description: 'Array of validation error messages or single error message',
    oneOf: [
      { type: 'string', example: 'Invalid request data' },
      { 
        type: 'array', 
        items: { type: 'string' },
        example: [
          'username should not be empty',
          'email must be an email',
          'password must be longer than or equal to 8 characters'
        ]
      }
    ],
  })
  message: string | string[];

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request',
  })
  error: string;
}

/**
 * 401 Unauthorized - Authentication required or failed
 */
export class UnauthorizedErrorResponseDto extends BaseErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 401,
  })
  statusCode: 401;

  @ApiProperty({
    description: 'Error message describing the authentication failure',
    example: 'Invalid credentials',
  })
  message: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Unauthorized',
  })
  error: string;
}

/**
 * 403 Forbidden - Access denied due to insufficient permissions
 */
export class ForbiddenErrorResponseDto extends BaseErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 403,
  })
  statusCode: 403;

  @ApiProperty({
    description: 'Error message describing the access restriction',
    example: 'Insufficient permissions to access this resource',
  })
  message: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Forbidden',
  })
  error: string;
}

/**
 * 404 Not Found - Resource not found
 */
export class NotFoundErrorResponseDto extends BaseErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 404,
  })
  statusCode: 404;

  @ApiProperty({
    description: 'Error message describing what was not found',
    example: 'User not found',
  })
  message: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Not Found',
  })
  error: string;
}

/**
 * 409 Conflict - Resource conflict (e.g., duplicate data)
 */
export class ConflictErrorResponseDto extends BaseErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 409,
  })
  statusCode: 409;

  @ApiProperty({
    description: 'Error message describing the conflict',
    example: 'Username or email already exists',
  })
  message: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Conflict',
  })
  error: string;
}

/**
 * 422 Unprocessable Entity - Semantic validation errors
 */
export class UnprocessableEntityErrorResponseDto extends BaseErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 422,
  })
  statusCode: 422;

  @ApiProperty({
    description: 'Error message describing the validation issue',
    example: 'The provided data could not be processed',
  })
  message: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Unprocessable Entity',
  })
  error: string;
}

/**
 * 500 Internal Server Error - Server-side errors
 */
export class InternalServerErrorResponseDto extends BaseErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 500,
  })
  statusCode: 500;

  @ApiProperty({
    description: 'Generic error message (details hidden for security)',
    example: 'Internal server error',
  })
  message: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Internal Server Error',
  })
  error: string;
}

/**
 * Specific validation error response with detailed field errors
 */
export class ValidationErrorResponseDto extends BadRequestErrorResponseDto {
  @ApiProperty({
    description: 'Array of detailed validation error messages',
    example: [
      'username should not be empty',
      'username must be a string',
      'email must be an email',
      'password must be longer than or equal to 8 characters',
      'password must be shorter than or equal to 128 characters'
    ],
    type: [String],
  })
  message: string[];

  @ApiProperty({
    description: 'Additional validation context (optional)',
    example: {
      field: 'email',
      value: 'invalid-email',
      constraints: {
        isEmail: 'email must be an email'
      }
    },
    required: false,
  })
  details?: {
    field: string;
    value: any;
    constraints: Record<string, string>;
  }[];
}