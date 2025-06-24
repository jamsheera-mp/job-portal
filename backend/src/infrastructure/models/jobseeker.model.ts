import { model, Schema } from "mongoose";
import { JobSeeker } from "../../domain/interfaces/jobseeker.interface";
import bcrypt from "bcryptjs";


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


JobSeekerSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 900, // 15 minutes
    partialFilterExpression: { isEmailVerified: false }
  }
);



export const JobSeekerModel = model<JobSeeker>('JobSeeker', JobSeekerSchema);
