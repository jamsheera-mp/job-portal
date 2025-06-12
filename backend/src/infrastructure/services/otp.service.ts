import { OtpModel } from '../database/otp.schema';

export class OtpService {
  async generateOtp(userId: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await OtpModel.create({ userId, otp, expiresAt });
    // TODO: Send OTP via email (e.g., using nodemailer)
    console.log(`OTP for user ${userId}: ${otp}`); // For testing
    return otp;
  }

  async verifyOtp(userId: string, otp: string): Promise<boolean> {
    const record = await OtpModel.findOne({ userId, otp, expiresAt: { $gt: new Date() } });
    if (record) {
      await OtpModel.deleteOne({ _id: record._id });
      return true;
    }
    return false;
  }
}