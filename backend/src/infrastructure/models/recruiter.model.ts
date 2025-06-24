import bcrypt from "bcryptjs";
import { model, Schema } from "mongoose";
import { Recruiter } from "../../domain/interfaces/recruiter.interface";


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


RecruiterSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 900, // 15 minutes
    partialFilterExpression: { isEmailVerified: false }
  }
);


export const RecruiterModel = model<Recruiter>('Recruiter', RecruiterSchema);
