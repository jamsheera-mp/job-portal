import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../interfaces/user.interface';

const TempUserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['jobSeeker', 'recruiter', 'admin'], required: true },
  name: { type: String },
  phone: { type: String },
  company: {
    name: { type: String },
    logoUrl: { type: String },
    description: { type: String },
    website: { type: String },
    industry: { type: String },
    location: { type: String },
  },
  otp: { type: String, required: true },
  otpExpires: { type: Date, required: true },
});

export const TempUserModel = mongoose.model<User & Document>('TempUser', TempUserSchema);