import { JobSeeker } from "../../domain/interfaces/jobseeker.interface";
import { JobSeekerRepository } from "../../domain/repositories/jobseeker.repository.interface";
import { JobSeekerModel } from "../models/jobseeker.model";

export class MongoJobSeekerRepository implements JobSeekerRepository {
  
  async create(jobSeeker: JobSeeker): Promise<JobSeeker> {
    const created = await JobSeekerModel.create({
      ...jobSeeker,
      isEmailVerified: false,
      isBlocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const plain = created.toObject(); //strips out Mongoose-specific
    //  properties and gives you a plain JS object that you can transform safely.
    return {
      ...plain,
      id: plain._id.toString(), // explicitly map _id to id
      //Mongoose _id is an ObjectId, which you must
      //  convert to a string for consistent ID handling in your domain layer.
    };
  }

  async findByEmail(email: string): Promise<JobSeeker | null> {
    const found = await JobSeekerModel.findOne({ email });
    if (!found) return null;
    const plain = found.toObject();
    return {
      ...plain,
      id: plain._id.toString(),
    };
  }

  async findById(id: string): Promise<JobSeeker | null> {
    const found = await JobSeekerModel.findById(id);
    if (!found) return null;
    const plain = found.toObject();
    return {
      ...plain,
      id: plain._id.toString(),
    };
  }

  async update(id: string, data: Partial<JobSeeker>): Promise<JobSeeker | null> {
    const updated = await JobSeekerModel.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return null;
    const plain = updated.toObject();
    return {
      ...plain,
      id: plain._id.toString(),
    };
  }
}
