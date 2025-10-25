import { Module, Global } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { UserRepository } from './database/repositories/user.repository';
import { BcryptPasswordHasher } from './security/bcrypt-password-hasher.service';
import { JwtTokenService } from './security/jwt-token.service';
import { LoginLogsService } from './logging/login-logs.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}), // Configuration will be done in the service
  ],
  providers: [
    PrismaService,
    // Repository implementations
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    // Security services
    {
      provide: 'IPasswordHasher',
      useClass: BcryptPasswordHasher,
    },
    {
      provide: 'ITokenService',
      useClass: JwtTokenService,
    },
    // Logging services
    {
      provide: 'ILoginLogsService',
      useClass: LoginLogsService,
    },
  ],
  exports: [
    PrismaService,
    'IUserRepository',
    'IPasswordHasher',
    'ITokenService',
    'ILoginLogsService',
  ],
})
export class InfrastructureModule {}
