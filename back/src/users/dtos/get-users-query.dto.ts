import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { UserStatus } from '@prisma/client';

export class GetUsersQueryDto {
  @ApiProperty({
    description: 'Page number for pagination (1-based)',
    example: 1,
    required: false,
    minimum: 1,
    maximum: 1000
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(1000)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of users per page',
    example: 10,
    required: false,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Search term to filter users by username or email',
    example: 'john',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter users by status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    required: false
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}