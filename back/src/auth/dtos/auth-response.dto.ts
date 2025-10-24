import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token for authentication. Use this token in the Authorization header as "Bearer <token>" for protected endpoints. Token expires in 15 minutes.',
    examples: {
      success: {
        summary: 'Successful login response',
        description: 'JWT access token returned after successful authentication',
        value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiam9obmRvZSIsInJvbGVzIjpbInVzZXIiXSwiaWF0IjoxNzAzMTU0MDAwLCJleHAiOjE3MDMxNTQ5MDB9.example_signature'
      }
    },
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiam9obmRvZSIsInJvbGVzIjpbInVzZXIiXSwiaWF0IjoxNzAzMTU0MDAwLCJleHAiOjE3MDMxNTQ5MDB9.example_signature',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token for obtaining new access tokens. Store this securely. Token expires in 7 days.',
    examples: {
      success: {
        summary: 'Refresh token',
        description: 'JWT refresh token for token rotation',
        value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzAzMTU0MDAwLCJleHAiOjE3MDM3NTg4MDB9.refresh_signature'
      }
    },
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzAzMTU0MDAwLCJleHAiOjE3MDM3NTg4MDB9.refresh_signature',
  })
  refreshToken: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token to obtain new access token. Must be a valid JWT token string obtained from login or previous refresh. Refresh tokens expire in 7 days.',
    examples: {
      valid_token: {
        summary: 'Valid refresh token',
        description: 'A valid refresh token for obtaining new access token',
        value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzAzMTU0MDAwLCJleHAiOjE3MDM3NTg4MDB9.refresh_signature'
      }
    },
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzAzMTU0MDAwLCJleHAiOjE3MDM3NTg4MDB9.refresh_signature',
    type: 'string',
    required: true,
    minLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export class RefreshResponseDto {
  @ApiProperty({
    description: 'New JWT access token with extended expiration time. Use this token for subsequent API calls.',
    examples: {
      refreshed: {
        summary: 'New access token',
        description: 'Fresh access token with new expiration time',
        value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiam9obmRvZSIsInJvbGVzIjpbInVzZXIiXSwiaWF0IjoxNzAzMTU0OTAwLCJleHAiOjE3MDMxNTU4MDB9.new_signature'
      }
    },
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiam9obmRvZSIsInJvbGVzIjpbInVzZXIiXSwiaWF0IjoxNzAzMTU0OTAwLCJleHAiOjE3MDMxNTU4MDB9.new_signature',
  })
  accessToken: string;

  @ApiProperty({
    description: 'New refresh token for future token refreshes. Store this securely and use it when the access token expires.',
    examples: {
      new_refresh: {
        summary: 'New refresh token',
        description: 'Updated refresh token with extended validity',
        value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzAzMTU0OTAwLCJleHAiOjE3MDM3NTk3MDB9.new_refresh_signature'
      }
    },
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzAzMTU0OTAwLCJleHAiOjE3MDM3NTk3MDB9.new_refresh_signature',
  })
  refreshToken: string;
}

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Logout success indicator. When true, the refresh token has been invalidated and cookies cleared.',
    examples: {
      success: {
        summary: 'Successful logout',
        description: 'User successfully logged out',
        value: true
      }
    },
    example: true,
  })
  ok: boolean;
}