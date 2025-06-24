import { OtpModel } from "../models/otp.model";
import bcrypt from "bcryptjs";
import { EmailService } from "./email.service";
import { generateOtpCode } from "../utils/otp.util"

export class OtpService {
  private readonly emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async generateOtp(userId: string, email: string): Promise<void> {
    const otp = generateOtpCode(); //  use utility function
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await OtpModel.deleteOne({ userId }); // Clear previous OTPs
    await OtpModel.create({ userId, otp: hashedOtp, expiresAt });

    console.log(`[OtpService] OTP stored in DB for user: ${userId}`);
    await this.emailService.sendOtpEmail(email, otp);
  }

  async verifyOtp(userId: string, inputOtp: string): Promise<boolean> {
    const otpDoc = await OtpModel.findOne({
      userId,
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      console.warn(`[OtpService] No valid OTP found for user: ${userId}`);
      return false;
    }

    const isMatch = await bcrypt.compare(inputOtp, otpDoc.otp);
    console.log(`[OtpService] OTP verification for user ${userId}: ${isMatch}`);
    return isMatch;
  }

  async deleteOtp(userId: string): Promise<void> {
    await OtpModel.deleteOne({ userId });
    console.log(`[OtpService] OTP deleted for user: ${userId}`);
  }
}
