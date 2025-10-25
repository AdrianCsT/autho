import { UserEntity } from '../../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByUsername(username: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByUsernameOrEmail(identifier: string): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  create(user: UserEntity): Promise<UserEntity>;
  update(user: UserEntity): Promise<UserEntity>;
  delete(id: string): Promise<void>;
  existsByUsername(username: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
}
