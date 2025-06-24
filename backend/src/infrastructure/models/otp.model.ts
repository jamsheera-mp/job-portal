import { model, Schema } from 'mongoose';
import { Otp } from '../../domain/interfaces/otp.interface'


const OtpSchema = new Schema<Otp>({
  userId: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: '10m' } },
});

export const OtpModel = model<Otp>('Otp', OtpSchema);