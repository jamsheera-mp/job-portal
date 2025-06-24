import { Recruiter } from '../interfaces/recruiter.interface';

export class RecruiterEntity {
  constructor(private recruiter: Recruiter) {}

  static create(data: Partial<Recruiter>): RecruiterEntity {
    if (!data.email || !data.password || !data.role || data.role !== 'recruiter') {
      throw new Error('Recruiter must have email, password, and role "recruiter"');
    }

    if (!data.company || !data.company.name) {
      throw new Error('Recruiter must have a company with at least a name');
    }

    return new RecruiterEntity({
      id: data.id ?? '',
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'recruiter',
      phone: data.phone,
      company: data.company,
      isBlocked: data.isBlocked ?? false,
      isEmailVerified: data.isEmailVerified ?? false,
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
    });
  }

  getData(): Recruiter {
    return { ...this.recruiter };
  }

  update(data: Partial<Recruiter>): void {
    this.recruiter = {
      ...this.recruiter,
      ...data,
      updatedAt: new Date(),
    };
  }
}
