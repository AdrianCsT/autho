import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { UpdateUserUseCase } from './use-cases/update-user.use-case';
import { ChangeUserStatusUseCase } from './use-cases/change-user-status.use-case';
import { DeleteUserUseCase } from './use-cases/delete-user.use-case';

@Module({
  imports: [InfrastructureModule],
  providers: [
    CreateUserUseCase,
    UpdateUserUseCase,
    ChangeUserStatusUseCase,
    DeleteUserUseCase,
  ],
  exports: [
    CreateUserUseCase,
    UpdateUserUseCase,
    ChangeUserStatusUseCase,
    DeleteUserUseCase,
  ],
})
export class UsersUseCasesModule {}
