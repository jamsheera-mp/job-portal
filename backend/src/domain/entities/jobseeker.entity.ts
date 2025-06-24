import { JobSeeker } from '../interfaces/jobseeker.interface';
import { UserEntity } from './user.entity';

export class JobSeekerEntity extends UserEntity {
  constructor(private seeker: JobSeeker) {
    super(seeker);
  }

  static create(data: Partial<JobSeeker>): JobSeekerEntity {
    if (!data.name) throw new Error('Name is required for job seekers');
    const base = UserEntity.create(data).getData();
    return new JobSeekerEntity({
      ...base,
      name: data.name,
      bio: data.bio,
      phone: data.phone,
      skills: data.skills ?? [],
      resumeUrl: data.resumeUrl,
      githubUrl: data.githubUrl,
      linkedinUrl: data.linkedinUrl,
      experience: data.experience ?? [],
      profilePictureUrl: data.profilePictureUrl,
    } as JobSeeker);
  }
}
