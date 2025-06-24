import { User } from '../interfaces/user.interface';

export class UserEntity {
  constructor(private user: User) {}

  static create(data: Partial<User>): UserEntity {
    if (!data.email || !data.password || !data.role) {
      throw new Error('Email, password, and role are required');
    }
    return new UserEntity({

      id: data.id ?? '', // Default to empty string if id is not provided
      email: data.email,
      password: data.password,
      role: data.role,
      phone:data.phone,
      company:data.company,
      isBlocked: data.isBlocked ?? false,
      isEmailVerified: data.isEmailVerified ?? false,
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
    });
  }

  getData(): User {
    return { ...this.user };
  }

  update(data: Partial<User>): void {
    this.user = {
      ...this.user,
      ...data,
      updatedAt: new Date(),
    };
  }

  verifyEmail(): void {
    this.user.isEmailVerified = true;
    this.user.updatedAt = new Date();
  }
}





