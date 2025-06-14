import { model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, JobSeeker, Recruiter, Admin } from '../../domain/interfaces/user.interface';
import { UserRepository } from '../../domain/interfaces/user.repository.interface';

const JobSeekerSchema = new Schema<JobSeeker>({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['jobSeeker'], default: 'jobSeeker' },
  isBlocked: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  name: { type: String, required: true },
  bio: String,
  phone: String,
  skills: [String],
  resumeUrl: String,
  githubUrl: String,
  linkedinUrl: String,
  experience: [{ company: String, role: String, years: Number }],
  profilePictureUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const RecruiterSchema = new Schema<Recruiter>({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['recruiter'], default: 'recruiter' },
  isBlocked: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  company: {
    name: String,
    logoUrl: String,
    description: String,
    website: String,
    industry: String,
    location: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const AdminSchema = new Schema<Admin>({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin'], default: 'admin' },
  isBlocked: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

JobSeekerSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

RecruiterSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

AdminSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const JobSeekerModel = model<JobSeeker>('JobSeeker', JobSeekerSchema);
const RecruiterModel = model<Recruiter>('Recruiter', RecruiterSchema);
const AdminModel = model<Admin>('Admin', AdminSchema);

export class MongoUserRepository implements UserRepository {
 async create(user: User): Promise<User> {
    try {
      let createdUser: any;
      switch (user.role) {
        case 'jobSeeker':
          createdUser = (await JobSeekerModel.create(user as JobSeeker)).toObject();
          break;
        case 'recruiter':
          createdUser = (await RecruiterModel.create(user as Recruiter)).toObject();
          break;
        case 'admin':
          createdUser = (await AdminModel.create(user as Admin)).toObject();
          break;
        default:
          throw new Error('Invalid role');
      }

      if (!createdUser._id) {
        throw new Error('MongoDB failed to generate an _id for the user');
      }

      // Transform _id to id to match the User interface
      const userWithId = {
        ...createdUser,
        id: createdUser._id.toString(),
      };
      delete userWithId._id; // Remove the _id field
      delete userWithId.__v; // Remove the version key

      return userWithId as User;
    } catch (error: any) {
      console.error('Error creating user in MongoDB:', error.message);
      throw new Error(`Failed to create user in MongoDB: ${error.message}`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      let user = await JobSeekerModel.findOne({ email }).lean();
      if (user) {
        return {
          ...user,
          id: user._id.toString(),
          _id: undefined,
          __v: undefined,
        } as User;
      }
      user = await RecruiterModel.findOne({ email }).lean();
      if (user) {
        return {
          ...user,
          id: user._id.toString(),
          _id: undefined,
          __v: undefined,
        } as User;
      }
      user = await AdminModel.findOne({ email }).lean();
      if (user) {
        return {
          ...user,
          id: user._id.toString(),
          _id: undefined,
          __v: undefined,
        } as User;
      }
      return null;
    } catch (error: any) {
      console.error('Error finding user by email:', error.message);
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      let user = await JobSeekerModel.findById(id).lean();
      if (user) {
        return {
          ...user,
          id: user._id.toString(),
          _id: undefined,
          __v: undefined,
        } as User;
      }
      user = await RecruiterModel.findById(id).lean();
      if (user) {
        return {
          ...user,
          id: user._id.toString(),
          _id: undefined,
          __v: undefined,
        } as User;
      }
      user = await AdminModel.findById(id).lean();
      if (user) {
        return {
          ...user,
          id: user._id.toString(),
          _id: undefined,
          __v: undefined,
        } as User;
      }
      return null;
    } catch (error: any) {
      console.error('Error finding user by ID:', error.message);
      throw new Error(`Failed to find user by ID: ${error.message}`);
    }
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    try {
      let Model;
      let user = await JobSeekerModel.findById(id).lean();
      if (user) Model = JobSeekerModel;
      else {
        user = await RecruiterModel.findById(id).lean();
        if (user) Model = RecruiterModel;
        else {
          user = await AdminModel.findById(id).lean();
          if (user) Model = AdminModel;
          else return null;
        }
      }
      const updatedUser = await Model.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { new: true }
      ).lean();
      if (!updatedUser) return null;
      return {
        ...updatedUser,
        id: updatedUser._id.toString(),
        _id: undefined,
        __v: undefined,
      } as User;
    } catch (error: any) {
      console.error('Error updating user:', error.message);
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }
}