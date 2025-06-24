import { Admin } from "../interfaces/admin.interface";
import { JobSeeker } from "../interfaces/jobseeker.interface";
import { Recruiter } from "../interfaces/recruiter.interface";


export interface AdminRepository {
    // Admin account management
    
    findByEmail(email: string): Promise<Admin | null>;
    findById(id: string): Promise<Admin | null>;
    update(id: string, data: Partial<Admin>): Promise<Admin | null>;

    // User management (job seekers and recruiters get,update and delete)
    getAllJobSeekers(filters?: { isBlocked?: boolean; skills?: string[] }): Promise<JobSeeker[]>
    getAllRecruiters(filters?: { isBlocked?: boolean; industry?: string }): Promise<Recruiter[]>

    updateJobSeeker(userId: string, data: Partial<JobSeeker>): Promise<JobSeeker | null>;
    updateRecruiter(userId: string, data: Partial<Recruiter>): Promise<Recruiter | null>;


    deleteJobSeeker(userId: string): Promise<boolean>;
    deleteRecruiter(userId: string): Promise<boolean>;

    // Job management
    getAllJobs(filters?: { status?: string; recruiterId?: string }): Promise<any[]>;
    updateJob(jobId: string, data: Partial<any>): Promise<any>;
    deleteJob(jobId: string): Promise<boolean>;
}
