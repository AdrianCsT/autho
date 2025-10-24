import { Body, Controller, Get, Post, Patch, Delete, UseGuards, Request, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { GetUsersQueryDto } from './dtos/get-users-query.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { PaginatedUsersResponseDto } from './dtos/paginated-users-response.dto';
import {
  ValidationErrorResponseDto,
  ConflictErrorResponseDto,
  UnauthorizedErrorResponseDto,
  InternalServerErrorResponseDto,
  NotFoundErrorResponseDto
} from '../common/dtos';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: `Creates a new user account with username, email, and password.
    
    **Usage Guidelines:**
    - Username must be unique across all users
    - Email must be unique and properly formatted
    - Password must be at least 8 characters long
    - All fields are required and cannot be empty
    - Account is immediately active after creation
    
    **Validation Rules:**
    - Username: Cannot be empty, used for login identification
    - Email: Must be valid email format, case-insensitive uniqueness
    - Password: Minimum 8 characters, maximum 128 characters
    
    **Security Notes:**
    - Passwords are securely hashed before storage
    - Email addresses are normalized to lowercase
    - Consider implementing email verification in production`,
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User registration data with username, email, and password',
    examples: {
      basic_user: {
        summary: 'Basic user registration',
        description: 'Standard user registration with required fields',
        value: {
          username: 'johndoe',
          email: 'john.doe@example.com',
          password: 'MySecureP@ssw0rd123!'
        }
      },
      simple_user: {
        summary: 'Simple registration',
        description: 'Registration with minimum requirements',
        value: {
          username: 'user123',
          email: 'user@example.com',
          password: 'password123'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully created - account is ready for use',
    type: UserResponseDto,
    schema: {
      example: {
        id: 1,
        username: 'johndoe',
        email: 'john.doe@example.com',
        roles: ['user'],
        createdAt: '2023-12-01T10:00:00.000Z',
        updatedAt: '2023-12-01T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - invalid input data',
    type: ValidationErrorResponseDto,
    schema: {
      example: {
        statusCode: 400,
        message: [
          'username should not be empty',
          'email must be an email',
          'password must be longer than or equal to 8 characters'
        ],
        error: 'Bad Request',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/users/register'
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - username or email already exists',
    type: ConflictErrorResponseDto,
    schema: {
      example: {
        statusCode: 409,
        message: 'Username or email already exists',
        error: 'Conflict',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/users/register'
      }
    }
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: InternalServerErrorResponseDto,
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/users/register'
      }
    }
  })
  async register(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto.username, dto.email, dto.password);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Get current user profile',
    description: `Retrieves the profile information of the currently authenticated user.
    
    **Usage Guidelines:**
    - Include JWT token in Authorization header as "Bearer <token>"
    - Returns complete user profile without sensitive information
    - Use this endpoint to display user information in UI
    - Profile data is always current and reflects latest updates
    
    **Authentication Required:**
    - Valid JWT access token in Authorization header
    - Token must not be expired (15-minute lifetime)
    - User must exist and be active in the system
    
    **Response Data:**
    - User ID, username, and email address
    - User roles and permissions
    - Account creation and last update timestamps
    - No sensitive data (passwords, tokens) included`,
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully - complete user information returned',
    type: UserResponseDto,
    schema: {
      example: {
        id: 1,
        username: 'johndoe',
        email: 'john.doe@example.com',
        roles: ['user'],
        createdAt: '2023-12-01T10:00:00.000Z',
        updatedAt: '2023-12-01T15:30:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
    type: UnauthorizedErrorResponseDto,
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/users/profile'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: NotFoundErrorResponseDto,
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/users/profile'
      }
    }
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: InternalServerErrorResponseDto,
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
        timestamp: '2023-12-01T10:00:00.000Z',
        path: '/users/profile'
      }
    }
  })
  async getProfile(@Request() req: any) {
    // The user object is attached to the request by the JWT strategy
    const userId = req.user.id;
    const user = await this.usersService.findById(userId);
    // Return safe user data without sensitive information
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
      role: user.role.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Get users with pagination and filtering',
    description: 'Retrieve a paginated list of users with optional search and status filtering'
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: PaginatedUsersResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
    type: UnauthorizedErrorResponseDto
  })
  async getUsers(@Query() query: GetUsersQueryDto) {
    return this.usersService.getUsers(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their unique identifier'
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
    type: UnauthorizedErrorResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: NotFoundErrorResponseDto
  })
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
      role: user.role.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Update user',
    description: 'Update user information including username, email, password, status, and roles'
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User update data'
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - invalid input data',
    type: ValidationErrorResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
    type: UnauthorizedErrorResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: NotFoundErrorResponseDto
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - username or email already exists',
    type: ConflictErrorResponseDto
  })
  async updateUser(@Param('id') id: string, @Body() updateData: UpdateUserDto) {
    return this.usersService.updateUser(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Delete user',
    description: 'Permanently delete a user account'
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    schema: {
      example: {
        message: 'User deleted successfully'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
    type: UnauthorizedErrorResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: NotFoundErrorResponseDto
  })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
