// Export all common error response DTOs
export * from './error-response.dto';
export * from './error-examples';
export * from './api-examples';

// Re-export commonly used DTOs for convenience
export {
  BadRequestErrorResponseDto,
  UnauthorizedErrorResponseDto,
  ForbiddenErrorResponseDto,
  NotFoundErrorResponseDto,
  ConflictErrorResponseDto,
  UnprocessableEntityErrorResponseDto,
  InternalServerErrorResponseDto,
  ValidationErrorResponseDto,
  BaseErrorResponseDto
} from './error-response.dto';

export { ErrorExamples, ValidationMessages } from './error-examples';
export { ApiExamples, UsageGuidelines } from './api-examples';