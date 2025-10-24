import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({
        description: 'Username for the account. Must be unique across all users and cannot be empty. Used for login identification. Can contain letters, numbers, and underscores.',
        examples: {
            simple: {
                summary: 'Simple username',
                description: 'A basic username with letters only',
                value: 'johndoe'
            },
            with_numbers: {
                summary: 'Username with numbers',
                description: 'Username containing letters and numbers',
                value: 'user123'
            },
            with_underscore: {
                summary: 'Username with underscore',
                description: 'Username with underscore separator',
                value: 'john_doe'
            }
        },
        example: 'johndoe',
        type: 'string',
        required: true,
        minLength: 1,
    })
    @IsNotEmpty()
    username: string;

    @ApiProperty({
        description: 'Valid email address for the account. Must be a properly formatted email and unique across all users. Will be used for account verification and password recovery. Email addresses are case-insensitive.',
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
            },
            subdomain: {
                summary: 'Subdomain email',
                description: 'Email with subdomain',
                value: 'user@mail.example.com'
            }
        },
        example: 'john.doe@example.com',
        type: 'string',
        format: 'email',
        required: true,
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Password for the account. Must be at least 8 characters long for security. Should contain a mix of letters, numbers, and special characters for better security. Maximum length is 128 characters.',
        examples: {
            strong: {
                summary: 'Strong password',
                description: 'A secure password with mixed characters',
                value: 'MySecureP@ssw0rd123!'
            },
            medium: {
                summary: 'Medium strength password',
                description: 'Password with letters and numbers',
                value: 'Password123'
            },
            minimum: {
                summary: 'Minimum requirements',
                description: 'Password meeting minimum length requirement',
                value: 'password123'
            }
        },
        example: 'MySecureP@ssw0rd123!',
        type: 'string',
        required: true,
        minLength: 8,
        maxLength: 128,
    })
    @MinLength(8)
    password: string;
}
