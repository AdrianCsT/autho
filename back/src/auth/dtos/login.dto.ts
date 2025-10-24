import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User identifier - can be either email address or username. This field is required and cannot be empty. Use the same identifier that was used during registration.',
    examples: {
      email: {
        summary: 'Login with email',
        description: 'Use email address as identifier',
        value: 'john.doe@example.com'
      },
      username: {
        summary: 'Login with username',
        description: 'Use username as identifier',
        value: 'johndoe'
      }
    },
    example: 'john.doe@example.com',
    type: 'string',
    required: true,
    minLength: 1,
  })
  @IsNotEmpty()
  identifier: string; // email or username

  @ApiProperty({
    description: 'User password for authentication. This field is required and cannot be empty. Must match the password set during registration. Passwords are case-sensitive.',
    examples: {
      strong_password: {
        summary: 'Strong password example',
        description: 'A secure password with mixed characters',
        value: 'MySecureP@ssw0rd123'
      },
      simple_password: {
        summary: 'Simple password example',
        description: 'A basic password meeting minimum requirements',
        value: 'password123'
      }
    },
    example: 'MySecureP@ssw0rd123',
    type: 'string',
    required: true,
    minLength: 1,
  })
  @IsNotEmpty()
  password: string;
}
