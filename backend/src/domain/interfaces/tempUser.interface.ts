
import { User } from './user.interface'

export interface TempUser extends User {
  otp: string;
  otpExpires: Date;
  attempts?: number,
}
