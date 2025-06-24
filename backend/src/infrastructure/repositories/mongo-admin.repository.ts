import { isValidObjectId } from "mongoose";
import { Admin } from "../../domain/interfaces/admin.interface";
import { JobSeeker } from "../../domain/interfaces/jobseeker.interface";
import { Recruiter } from "../../domain/interfaces/recruiter.interface";
import { User } from "../../domain/interfaces/user.interface";
import { AdminRepository } from "../../domain/repositories/admin.repository.interface";
import { AdminModel } from "../models/admin.model";
import { JobSeekerModel } from "../models/jobseeker.model";
import { RecruiterModel } from "../models/recruiter.model";


export class MongoAdminRepository implements AdminRepository {

    //For admin account management
    async findByEmail(email: string): Promise<Admin | null> {
        return await AdminModel.findOne({ email })
    }


    async findById(id: string): Promise<Admin | null> {
        if (!isValidObjectId(id)) return null;
        return await AdminModel.findById(id);
    }

    async update(id: string, data: Partial<Admin>): Promise<Admin | null> {
        if (!isValidObjectId(id)) return null;
        return await AdminModel.findByIdAndUpdate(id, data, { new: true });
    }
 
    //For user management - job seekers and recruiters
    async getAllUsers(filters: { role?: 'jobSeeker' | 'recruiter'; isBlocked?: boolean } = {}): Promise<User[]> {
        const { role, isBlocked } = filters;
        const query: any = {};
        if (isBlocked !== undefined) query.isBlocked = isBlocked;

        const jobSeekers = (role === 'jobSeeker' || !role) ? await JobSeekerModel.find(query) : [];
        const recruiters = (role === 'recruiter' || !role) ? await RecruiterModel.find(query) : [];

        return [...jobSeekers, ...recruiters];
    }

    async updateJobSeeker(userId: string, data: Partial<JobSeeker>): Promise<JobSeeker | null> {
        const updated = await JobSeekerModel.findByIdAndUpdate(userId, data, { new: true });
        return updated ? (updated.toObject() as JobSeeker) : null;
    }

    async deleteJobSeeker(userId: string): Promise<boolean> {
        const result = await JobSeekerModel.findByIdAndDelete(userId);
        return !!result;
    }

    async updateRecruiter(userId: string, data: Partial<Recruiter>): Promise<Recruiter | null> {
        const updated = await RecruiterModel.findByIdAndUpdate(userId, data, { new: true });
        return updated ? (updated.toObject() as Recruiter) : null;
    }

    async deleteRecruiter(userId: string): Promise<boolean> {
        const result = await RecruiterModel.findByIdAndDelete(userId);
        return !!result;
    }


    /*
    //For job management
      async getAllJobs(filters: { status?: 'open' | 'closed' | 'rejected'; recruiterId?: string } = {}): Promise<Job[]> {
        const query: any = {};
        if (filters.status) query.status = filters.status;
        if (filters.recruiterId) query.recruiterId = new Types.ObjectId(filters.recruiterId);
        return await JobModel.find(query);
      }
    
      async updateJob(jobId: string, data: Partial<Job>): Promise<Job | null> {
        return await JobModel.findByIdAndUpdate(jobId, data, { new: true });
      }
    
      async deleteJob(jobId: string): Promise<boolean> {
        const result = await JobModel.findByIdAndDelete(jobId);
        return !!result;
      }
        */
}