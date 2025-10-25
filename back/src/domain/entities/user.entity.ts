import { Email } from '../value-objects/email.vo';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface UserProps {
  id: string;
  username: string;
  email: Email;
  passwordHash: string;
  roles: string[];
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class UserEntity {
  private readonly props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  static create(props: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt'>): UserEntity {
    const now = new Date();
    return new UserEntity({
      ...props,
      id: '', // Will be set by repository
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: UserProps): UserEntity {
    return new UserEntity(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get username(): string {
    return this.props.username;
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get roles(): string[] {
    return [...this.props.roles];
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business methods
  isActive(): boolean {
    return this.props.status === UserStatus.ACTIVE;
  }

  isInactive(): boolean {
    return this.props.status === UserStatus.INACTIVE;
  }

  isSuspended(): boolean {
    return this.props.status === UserStatus.SUSPENDED;
  }

  canLogin(): boolean {
    return this.isActive();
  }

  hasRole(role: string): boolean {
    return this.props.roles.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  activate(): void {
    if (this.props.status === UserStatus.ACTIVE) {
      throw new Error('User is already active');
    }
    this.props.status = UserStatus.ACTIVE;
    this.props.updatedAt = new Date();
  }

  suspend(): void {
    if (this.props.status === UserStatus.SUSPENDED) {
      throw new Error('User is already suspended');
    }
    this.props.status = UserStatus.SUSPENDED;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    if (this.props.status === UserStatus.INACTIVE) {
      throw new Error('User is already inactive');
    }
    this.props.status = UserStatus.INACTIVE;
    this.props.updatedAt = new Date();
  }

  updatePassword(newPasswordHash: string): void {
    this.props.passwordHash = newPasswordHash;
    this.props.updatedAt = new Date();
  }

  addRole(role: string): void {
    if (this.hasRole(role)) {
      throw new Error(`User already has role: ${role}`);
    }
    this.props.roles.push(role);
    this.props.updatedAt = new Date();
  }

  removeRole(role: string): void {
    const index = this.props.roles.indexOf(role);
    if (index === -1) {
      throw new Error(`User does not have role: ${role}`);
    }
    this.props.roles.splice(index, 1);
    this.props.updatedAt = new Date();
  }

  toObject(): UserProps {
    return {
      ...this.props,
      roles: [...this.props.roles],
    };
  }

  toPersistence() {
    return {
      id: this.props.id,
      username: this.props.username,
      email: this.props.email.getValue(),
      passwordHash: this.props.passwordHash,
      status: this.props.status,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
