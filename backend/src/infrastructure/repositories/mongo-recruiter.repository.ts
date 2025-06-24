

import { RecruiterModel } from '../models/recruiter.model';
import { RecruiterRepository } from '../../domain/repositories/recruiter.repository.interface';
import { Recruiter } from '../../domain/interfaces/recruiter.interface';

export class MongoRecruiterRepository implements RecruiterRepository {

  async create(recruiter: Recruiter): Promise<Recruiter> {
  const created =  await RecruiterModel.create({
    ...recruiter,
    isEmailVerified: false,
    isBlocked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const plain = created.toObject();
    return {
      ...plain,
      id: plain._id.toString(), // explicitly map _id to id
    };
}


  async findByEmail(email: string): Promise<Recruiter | null> {
   const found =  await RecruiterModel.findOne({ email });
   if (!found) return null;
    const plain = found.toObject();
    return {
      ...plain,
      id: plain._id.toString(),
    };
  }

  async findById(id: string): Promise<Recruiter | null> {
    const found =  await RecruiterModel.findById(id);
    if (!found) return null;
    const plain = found.toObject();
    return {
      ...plain,
      id: plain._id.toString(),
    };
  }

  async update(id: string, data: Partial<Recruiter>): Promise<Recruiter | null> {
    const updated =  await RecruiterModel.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return null;
    const plain = updated.toObject();
    return {
      ...plain,
      id: plain._id.toString(),
    };
  }
  
/*

  //Job related repositories

  async postJob(job: Job): Promise<Job> {
    return await JobModel.create(job);
  }

  async getJobsByRecruiter(recruiterId: string): Promise<Job[]> {
    return await JobModel.find({ recruiterId });
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
