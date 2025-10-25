import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(32)
  JWT_ACCESS_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(32)
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_EXPIRATION?: string = '15m';

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRATION?: string = '7d';

  @IsString()
  @IsOptional()
  NODE_ENV?: string = 'development';

  @IsString()
  @IsOptional()
  PORT?: string = '3000';

  @IsString()
  @IsOptional()
  DOCS_ENABLED?: string = 'true';

  @IsString()
  @IsOptional()
  DOCS_PATH?: string = 'api/docs';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = new EnvironmentVariables();
  Object.assign(validatedConfig, config);

  // Simple validation - throw if required vars missing
  if (!validatedConfig.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }
  if (!validatedConfig.JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET is required');
  }
  if (!validatedConfig.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is required');
  }

  return validatedConfig;
}
