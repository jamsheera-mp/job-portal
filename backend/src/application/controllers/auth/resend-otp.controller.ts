import { Request, Response } from "express";
import { MongoJobSeekerRepository } from "../../../infrastructure/repositories/mongo-jobseeker.repository";
import { MongoRecruiterRepository } from "../../../infrastructure/repositories/mongo-recruiter.repository";
import { OtpService } from "../../../infrastructure/services/otp.service";
import { ResendOtpRequestDto, ResendOtpResponseDto } from "../../dtos/auth/resend-otp.dto";

export class ResendOtpController {
  private jobSeekerRepo = new MongoJobSeekerRepository();
  private recruiterRepo = new MongoRecruiterRepository();
  private otpService = new OtpService();

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email }: ResendOtpRequestDto = req.body;

      console.log("[ResendOtpController] Incoming request to resend OTP:", email);

      if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
      }

      // Check if user exists in either collection
      const jobSeeker = await this.jobSeekerRepo.findByEmail(email);
      const recruiter = await this.recruiterRepo.findByEmail(email);
      const user = jobSeeker || recruiter;

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      if (user.isEmailVerified) {
        res.status(400).json({ message: "Email is already verified" });
        return;
      }

      // Generate and send new OTP
      await this.otpService.generateOtp(user.id, user.email);
      console.log("[ResendOtpController] OTP resent successfully to:", user.email);

      res.status(200).json({
        message: "OTP resent to email",
      } as ResendOtpResponseDto);
    } catch (error: any) {
      console.error("[ResendOtpController] Error:", error.message);
      res.status(500).json({ message: error.message || "Failed to resend OTP" });
    }
  }
}
