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
    let Model;
    switch (user.role) {
      case 'jobSeeker':
        Model = JobSeekerModel;
        break;
      case 'recruiter':
        Model = RecruiterModel;
        break;
      case 'admin':
        Model = AdminModel;
        break;
      default:
        throw new Error('Invalid role');
    }
    const createdUser = await Model.create(user);
    return createdUser.toObject();
  }

  async findByEmail(email: string): Promise<User | null> {
    let user = await JobSeekerModel.findOne({ email }).lean();
    if (user) return user;
    user = await RecruiterModel.findOne({ email }).lean();
    if (user) return user;
    user = await AdminModel.findOne({ email }).lean();
    return user;
  }

  async findById(id: string): Promise<User | null> {
    let user = await JobSeekerModel.findById(id).lean();
    if (user) return user;
    user = await RecruiterModel.findById(id).lean();
    if (user) return user;
    user = await AdminModel.findById(id).lean();
    return user;
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
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
    const updatedUser = await Model.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true }).lean();
    return updatedUser;
  }
}