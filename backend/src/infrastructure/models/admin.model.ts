import { model, Schema } from "mongoose";
import { Admin } from "../../domain/interfaces/admin.interface";
import bcrypt from "bcryptjs";


const AdminSchema = new Schema<Admin>({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin'], default: 'admin' },
  isBlocked: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
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


export const AdminModel = model<Admin>('Admin', AdminSchema);