import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the user. This ID is used internally and remains constant throughout the user\'s lifecycle.',
    examples: {
      new_user: {
        summary: 'New user ID',
        description: 'ID for a recently created user',
        value: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
      },
      existing_user: {
        summary: 'Existing user ID',
        description: 'ID for an established user',
        value: 'f9e8d7c6-b5a4-3210-9876-543210fedcba'
      }
    },
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Username for the account. This is the unique identifier chosen by the user during registration.',
    examples: {
      simple: {
        summary: 'Simple username',
        description: 'Basic username format',
        value: 'johndoe'
      },
      with_underscore: {
        summary: 'Username with underscore',
        description: 'Username containing underscore',
        value: 'john_doe'
      },
      with_numbers: {
        summary: 'Username with numbers',
        description: 'Username containing numbers',
        value: 'user123'
      }
    },
    example: 'johndoe',
  })
  username: string;

  @ApiProperty({
    description: 'Email address of the user. This is the verified email address used for account communications.',
    examples: {
      personal: {
        summary: 'Personal email',
        description: 'Personal email address',
        value: 'john.doe@gmail.com'
      },
      business: {
        summary: 'Business email',
        description: 'Corporate email address',
        value: 'john.doe@company.com'
      }
    },
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User status indicating account state',
    examples: {
      active: {
        summary: 'Active user',
        description: 'User account is active and can access the system',
        value: 'ACTIVE'
      },
      suspended: {
        summary: 'Suspended user',
        description: 'User account is temporarily suspended',
        value: 'SUSPENDED'
      }
    },
    example: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']
  })
  status?: string;

  @ApiProperty({
    description: 'User role assigned to this account. Determines access permissions and available features.',
    examples: {
      regular_user: {
        summary: 'Regular user',
        description: 'Standard user with basic permissions',
        value: 'user'
      },
      admin_user: {
        summary: 'Admin user',
        description: 'User with administrative privileges',
        value: 'admin'
      }
    },
    example: 'user'
  })
  role?: string;

  @ApiProperty({
    description: 'Timestamp when the user account was created. ISO 8601 format.',
    examples: {
      recent: {
        summary: 'Recently created',
        description: 'Account created recently',
        value: '2023-12-01T10:00:00.000Z'
      },
      older: {
        summary: 'Older account',
        description: 'Account created some time ago',
        value: '2023-01-15T08:30:00.000Z'
      }
    },
    example: '2023-12-01T10:00:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Timestamp when the user account was last updated. ISO 8601 format.',
    examples: {
      recent_update: {
        summary: 'Recently updated',
        description: 'Account updated recently',
        value: '2023-12-01T15:30:00.000Z'
      },
      no_updates: {
        summary: 'No updates',
        description: 'Account never updated since creation',
        value: '2023-12-01T10:00:00.000Z'
      }
    },
    example: '2023-12-01T15:30:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  updatedAt?: Date;
}