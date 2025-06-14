import mongoose, { Schema, Document } from 'mongoose';
import { TempUser } from '../interfaces/tempUser.interface';

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
  attempts: { type: Number, default: 0 },
}, {
  timestamps: true,
});

//  TTL Index – deletes document after otpExpires is reached
TempUserSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 0 });

export const TempUserModel = mongoose.model<TempUser & Document>('TempUser', TempUserSchema);
