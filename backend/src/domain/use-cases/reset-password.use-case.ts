import { MongoUserRepository } from "../../infrastructure/repositories/mongo-user.repository";
import { OtpService } from "../../infrastructure/services/otp.service";
import bcrypt from "bcryptjs";

export class ResetPasswordUseCase {
  private readonly userRepository: MongoUserRepository;
  private readonly otpService: OtpService;

  constructor(userRepository: MongoUserRepository, otpService: OtpService) {
    this.userRepository = userRepository;
    this.otpService = otpService;
  }

  async execute(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    try {
      // Find user to get userId
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error("User not found");
      }

      // Verify OTP for reset
      const isValid = await this.otpService.verifyOtp(email, otp, true);
      if (!isValid) {
        throw new Error("Invalid or expired OTP");
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await this.userRepository.update(user.id, { password: hashedPassword });

      // Clear OTP
      await this.otpService.deleteTempUser(email);

      return { message: "Password reset successful" };
    } catch (error: any) {
      throw new Error(error.message || "Failed to reset password");
    }
  }
}