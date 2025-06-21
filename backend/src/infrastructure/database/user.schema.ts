import { model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { JobSeeker, Recruiter, Admin } from '../../domain/interfaces/user.interface';

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
  if (this.isModified('password') && !this.password.startsWith('$2b$')) {
    console.log('[JobSeekerSchema] Hashing password for:', this.email);
    this.password = await bcrypt.hash(this.password, 10);
  } else {
    console.log('[JobSeekerSchema] Skipping password hashing for:', this.email);
  }
  this.updatedAt = new Date();
  next();
});

RecruiterSchema.pre('save', async function (next) {
  if (this.isModified('password') && !this.password.startsWith('$2b$')) {
    console.log('[RecruiterSchema] Hashing password for:', this.email);
    this.password = await bcrypt.hash(this.password, 10);
  } else {
    console.log('[RecruiterSchema] Skipping password hashing for:', this.email);
  }
  this.updatedAt = new Date();
  next();
});

AdminSchema.pre('save', async function (next) {
  if (this.isModified('password') && !this.password.startsWith('$2b$')) {
    console.log('[AdminSchema] Hashing password for:', this.email);
    this.password = await bcrypt.hash(this.password, 10);
  } else {
    console.log('[AdminSchema] Skipping password hashing for:', this.email);
  }
  this.updatedAt = new Date();
  next();
});

export const JobSeekerModel = model<JobSeeker>('JobSeeker', JobSeekerSchema);
export const RecruiterModel = model<Recruiter>('Recruiter', RecruiterSchema);
export const AdminModel = model<Admin>('Admin', AdminSchema);