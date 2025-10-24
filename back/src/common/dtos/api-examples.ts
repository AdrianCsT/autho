/**
 * Comprehensive API request and response examples for documentation
 * These examples provide realistic data for all endpoints to help developers
 * understand the expected request/response formats and usage patterns.
 */

export const ApiExamples = {
  // Authentication Examples
  Auth: {
    Login: {
      Request: {
        email_login: {
          summary: 'Login with email',
          description: 'Authenticate using email address as identifier',
          value: {
            identifier: 'john.doe@example.com',
            password: 'MySecureP@ssw0rd123!'
          }
        },
        username_login: {
          summary: 'Login with username',
          description: 'Authenticate using username as identifier',
          value: {
            identifier: 'johndoe',
            password: 'MySecureP@ssw0rd123!'
          }
        },
        simple_login: {
          summary: 'Simple login',
          description: 'Basic login with minimum requirements',
          value: {
            identifier: 'user@example.com',
            password: 'password123'
          }
        }
      },
      Response: {
        success: {
          summary: 'Successful login',
          description: 'JWT access token returned after successful authentication',
          value: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiam9obmRvZSIsInJvbGVzIjpbInVzZXIiXSwiaWF0IjoxNzAzMTU0MDAwLCJleHAiOjE3MDMxNTQ5MDB9.example_signature'
          }
        }
      }
    },
    Refresh: {
      Request: {
        valid_token: {
          summary: 'Valid refresh token',
          description: 'Use a valid refresh token to get new tokens',
          value: {
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzAzMTU0MDAwLCJleHAiOjE3MDM3NTg4MDB9.refresh_signature'
          }
        }
      },
      Response: {
        success: {
          summary: 'Token refresh successful',
          description: 'New access and refresh tokens generated',
          value: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiam9obmRvZSIsInJvbGVzIjpbInVzZXIiXSwiaWF0IjoxNzAzMTU0OTAwLCJleHAiOjE3MDMxNTU4MDB9.new_signature',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzAzMTU0OTAwLCJleHAiOjE3MDM3NTk3MDB9.new_refresh_signature'
          }
        }
      }
    },
    Logout: {
      Request: {
        logout_token: {
          summary: 'Logout with refresh token',
          description: 'Provide refresh token to invalidate session',
          value: {
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzAzMTU0MDAwLCJleHAiOjE3MDM3NTg4MDB9.refresh_signature'
          }
        }
      },
      Response: {
        success: {
          summary: 'Successful logout',
          description: 'Session invalidated and cookies cleared',
          value: {
            ok: true
          }
        }
      }
    },
    Verify: {
      Response: {
        success: {
          summary: 'Token verification successful',
          description: 'Valid token with user information',
          value: {
            valid: true,
            user: {
              id: 1,
              username: 'johndoe',
              roles: ['user']
            }
          }
        }
      }
    }
  },

  // User Management Examples
  Users: {
    Register: {
      Request: {
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
        },
        business_user: {
          summary: 'Business user registration',
          description: 'Registration with corporate email',
          value: {
            username: 'jane_smith',
            email: 'jane.smith@company.com',
            password: 'CorporateP@ss2023!'
          }
        }
      },
      Response: {
        success: {
          summary: 'User created successfully',
          description: 'New user account created and ready for use',
          value: {
            id: 1,
            username: 'johndoe',
            email: 'john.doe@example.com',
            roles: ['user'],
            createdAt: '2023-12-01T10:00:00.000Z',
            updatedAt: '2023-12-01T10:00:00.000Z'
          }
        }
      }
    },
    Profile: {
      Response: {
        basic_profile: {
          summary: 'Basic user profile',
          description: 'Standard user profile information',
          value: {
            id: 1,
            username: 'johndoe',
            email: 'john.doe@example.com',
            roles: ['user'],
            createdAt: '2023-12-01T10:00:00.000Z',
            updatedAt: '2023-12-01T15:30:00.000Z'
          }
        },
        admin_profile: {
          summary: 'Admin user profile',
          description: 'Profile of user with administrative privileges',
          value: {
            id: 2,
            username: 'admin_user',
            email: 'admin@example.com',
            roles: ['user', 'admin'],
            createdAt: '2023-01-15T08:30:00.000Z',
            updatedAt: '2023-12-01T09:15:00.000Z'
          }
        }
      }
    }
  },

  // Common Error Examples
  Errors: {
    Validation: {
      login_validation: {
        summary: 'Login validation error',
        description: 'Missing required fields in login request',
        value: {
          statusCode: 400,
          message: [
            'identifier should not be empty',
            'password should not be empty'
          ],
          error: 'Bad Request',
          timestamp: '2023-12-01T10:00:00.000Z',
          path: '/auth/login'
        }
      },
      registration_validation: {
        summary: 'Registration validation error',
        description: 'Invalid data in user registration request',
        value: {
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
      },
      detailed_validation: {
        summary: 'Detailed validation error',
        description: 'Validation error with field-specific details',
        value: {
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
      }
    },
    Authentication: {
      invalid_credentials: {
        summary: 'Invalid credentials',
        description: 'Wrong email/username or password',
        value: {
          statusCode: 401,
          message: 'Invalid credentials',
          error: 'Unauthorized',
          timestamp: '2023-12-01T10:00:00.000Z',
          path: '/auth/login'
        }
      },
      invalid_token: {
        summary: 'Invalid token',
        description: 'Expired or malformed JWT token',
        value: {
          statusCode: 401,
          message: 'Invalid or expired token',
          error: 'Unauthorized',
          timestamp: '2023-12-01T10:00:00.000Z',
          path: '/auth/verify'
        }
      },
      missing_token: {
        summary: 'Missing authorization token',
        description: 'No token provided in Authorization header',
        value: {
          statusCode: 401,
          message: 'No authorization token was found',
          error: 'Unauthorized',
          timestamp: '2023-12-01T10:00:00.000Z',
          path: '/users/profile'
        }
      }
    },
    Conflict: {
      user_exists: {
        summary: 'User already exists',
        description: 'Username or email already registered',
        value: {
          statusCode: 409,
          message: 'Username or email already exists',
          error: 'Conflict',
          timestamp: '2023-12-01T10:00:00.000Z',
          path: '/users/register'
        }
      },
      email_exists: {
        summary: 'Email already exists',
        description: 'Email address is already registered',
        value: {
          statusCode: 409,
          message: 'Email address is already registered',
          error: 'Conflict',
          timestamp: '2023-12-01T10:00:00.000Z',
          path: '/users/register'
        }
      }
    },
    NotFound: {
      user_not_found: {
        summary: 'User not found',
        description: 'Requested user does not exist',
        value: {
          statusCode: 404,
          message: 'User not found',
          error: 'Not Found',
          timestamp: '2023-12-01T10:00:00.000Z',
          path: '/users/profile'
        }
      },
      endpoint_not_found: {
        summary: 'Endpoint not found',
        description: 'Requested API endpoint does not exist',
        value: {
          statusCode: 404,
          message: 'Cannot GET /api/nonexistent',
          error: 'Not Found',
          timestamp: '2023-12-01T10:00:00.000Z',
          path: '/api/nonexistent'
        }
      }
    },
    Server: {
      internal_error: {
        summary: 'Internal server error',
        description: 'Unexpected server error occurred',
        value: {
          statusCode: 500,
          message: 'Internal server error',
          error: 'Internal Server Error',
          timestamp: '2023-12-01T10:00:00.000Z',
          path: '/auth/login'
        }
      },
      database_error: {
        summary: 'Database connection error',
        description: 'Failed to connect to database',
        value: {
          statusCode: 500,
          message: 'Database connection failed',
          error: 'Internal Server Error',
          timestamp: '2023-12-01T10:00:00.000Z',
          path: '/users/register'
        }
      }
    }
  }
};

/**
 * Usage guidelines for different API scenarios
 */
export const UsageGuidelines = {
  Authentication: {
    login: `
**Usage Guidelines:**
- Use either email address or username as the identifier
- Password is case-sensitive and must match exactly
- Successful login returns an access token valid for 15 minutes
- HTTP-only cookies are set for enhanced security
- Access token should be used in Authorization header as "Bearer <token>"

**Security Notes:**
- Failed login attempts are logged for security monitoring
- Account lockout may occur after multiple failed attempts
- Use HTTPS in production to protect credentials
    `,
    refresh: `
**Usage Guidelines:**
- Use this endpoint when your access token expires (after 15 minutes)
- Provide the refresh token obtained from login or previous refresh
- Both access and refresh tokens are rotated for security
- Store the new refresh token securely for future use

**Security Notes:**
- Refresh tokens expire after 7 days of inactivity
- Each refresh token can only be used once (token rotation)
- Invalid or expired refresh tokens will result in 401 error
    `,
    logout: `
**Usage Guidelines:**
- Provide the refresh token to invalidate the session
- All HTTP-only cookies will be cleared automatically
- Access tokens remain valid until expiration (15 minutes)
- Recommended to call this endpoint when user explicitly logs out

**Security Notes:**
- Refresh token is permanently invalidated and cannot be reused
- Client should discard any stored tokens after logout
- Consider implementing client-side token cleanup
    `,
    verify: `
**Usage Guidelines:**
- Include JWT token in Authorization header as "Bearer <token>"
- Use this endpoint to validate tokens before making API calls
- Returns user information if token is valid and not expired
- Useful for client-side authentication state management

**Authentication Required:**
- Valid JWT access token in Authorization header
- Token must not be expired (15-minute lifetime)
- Token must be properly formatted and signed
    `
  },
  Users: {
    register: `
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
- Consider implementing email verification in production
    `,
    profile: `
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
- No sensitive data (passwords, tokens) included
    `
  }
};