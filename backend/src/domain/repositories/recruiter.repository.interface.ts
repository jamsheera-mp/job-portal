

import { Recruiter } from "../interfaces/recruiter.interface";




export interface RecruiterRepository {
  create(recruiter: Recruiter): Promise<Recruiter>;
  findByEmail(email: string): Promise<Recruiter | null>;
  findById(id: string): Promise<Recruiter | null>;
  update(id: string, data: Partial<Recruiter>): Promise<Recruiter | null>;

  // Job-related methods
  postJob(jobData: any): Promise<any>; // Define Job interface if available
  getJobsByRecruiter(recruiterId: string, status?: string): Promise<any[]>;
  updateJob(jobId: string, data: Partial<any>): Promise<any>;
  deleteJob(jobId: string): Promise<boolean>;
}
