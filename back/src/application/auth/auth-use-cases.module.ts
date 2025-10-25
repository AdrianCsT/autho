import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { LoginUseCase } from './use-cases/login.use-case';
import { RegisterUseCase } from './use-cases/register.use-case';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case';
import { LogoutUseCase } from './use-cases/logout.use-case';

@Module({
  imports: [InfrastructureModule],
  providers: [
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
  ],
  exports: [
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
  ],
})
export class AuthUseCasesModule {}
