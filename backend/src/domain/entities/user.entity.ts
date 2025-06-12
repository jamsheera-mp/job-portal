import { User, JobSeeker, Recruiter, Admin } from '../interfaces/user.interface';

export class UserEntity {
  constructor(private user: User) {}

  static create(data: Partial<User>): UserEntity {
    if (!data.email || !data.password || !data.role) {
      throw new Error('Email, password, and role are required');
    }
    return new UserEntity({
      email: data.email,
      password: data.password,
      role: data.role,
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

export class JobSeekerEntity extends UserEntity {
  constructor(user: JobSeeker) {
    super(user);
  }

  static create(data: Partial<JobSeeker>): JobSeekerEntity {
    if (!data.name) {
      throw new Error('Name is required for job seekers');
    }
    return new JobSeekerEntity({
      ...UserEntity.create(data).getData(),
      name: data.name,
      bio: data.bio,
      phone: data.phone,
      skills: data.skills ?? [],
      resumeUrl: data.resumeUrl,
      githubUrl: data.githubUrl,
      linkedinUrl: data.linkedinUrl,
      experience: data.experience ?? [],
      profilePictureUrl: data.profilePictureUrl,
    });
  }
}

export class RecruiterEntity extends UserEntity {
  constructor(user: Recruiter) {
    super(user);
  }

  static create(data: Partial<Recruiter>): RecruiterEntity {
    return new RecruiterEntity({
      ...UserEntity.create(data).getData(),
      company: data.company ?? { name: '' },
    });
  }
}

export class AdminEntity extends UserEntity {
  constructor(user: Admin) {
    super(user);
  }

  static create(data: Partial<Admin>): AdminEntity {
    return new AdminEntity({
      ...UserEntity.create(data).getData(),
    });
  }
}