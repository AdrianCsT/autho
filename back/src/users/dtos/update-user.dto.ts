import { IsEmail, IsOptional, MinLength, IsEnum, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Username for the account. Must be unique if provided.',
    example: 'johndoe_updated',
    required: false
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    description: 'Email address for the account. Must be unique if provided.',
    example: 'john.updated@example.com',
    required: false
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'New password for the account. Must be at least 8 characters.',
    example: 'NewSecurePassword123!',
    required: false,
    minLength: 8
  })
  @IsOptional()
  @MinLength(8)
  password?: string;

  @ApiProperty({
    description: 'User status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    required: false
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({
    description: 'Role name to assign to the user',
    example: 'user',
    required: false
  })
  @IsOptional()
  @IsString()
  role?: string;
}