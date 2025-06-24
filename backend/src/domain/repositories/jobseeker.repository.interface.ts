
import { JobSeeker } from "../interfaces/jobseeker.interface";

export interface JobSeekerRepository {
  create(jobSeeker: JobSeeker): Promise<JobSeeker>;
  findByEmail(email: string): Promise<JobSeeker | null>;
  findById(id: string): Promise<JobSeeker | null>;
  update(id: string, data: Partial<JobSeeker>): Promise<JobSeeker | null>;

  // Additional methods for profile and job browsing
  updateProfile(id: string, data: Partial<JobSeeker>): Promise<JobSeeker | null>;
  getFilteredJobs(filters: {
    location?: string;
    jobType?: string;
    skills?: string[];
    experience?: number;
    salary?: number;
  }): Promise<any[]>; // Replace `any` with a proper Job type 

  searchJobsBySkills(skills: string[]): Promise<any[]>;
}
