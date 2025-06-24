import { Request, Response } from "express";
import { MongoJobSeekerRepository } from "../../../infrastructure/repositories/mongo-jobseeker.repository";
import { MongoRecruiterRepository } from "../../../infrastructure/repositories/mongo-recruiter.repository";
import { OtpService } from "../../../infrastructure/services/otp.service";
import { VerifyOtpRequestDto } from "../../dtos/auth/verify-otp.dto";
import { mapUserToVerifyOtpResponse } from "../../mappers/auth.mapper";

export class VerifyOtpController {
    private jobSeekerRepo = new MongoJobSeekerRepository();
    private recruiterRepo = new MongoRecruiterRepository();
    private otpService = new OtpService();

    async verifyOtp(req: Request, res: Response): Promise<void> {
        try {
            const { email, otp }: VerifyOtpRequestDto = req.body;

            console.log("[VerifyOtpController] Incoming request:", { email, otp });

            if (!email || !otp) {
                res.status(400).json({ message: "Email and OTP are required" });
                return;
            }

            // Find the user from both collections
            const jobSeeker = await this.jobSeekerRepo.findByEmail(email);
            const recruiter = await this.recruiterRepo.findByEmail(email);
            const user = jobSeeker || recruiter;

            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            const isValid = await this.otpService.verifyOtp(user.id, otp);
            if (!isValid) {
                res.status(400).json({ message: "Invalid or expired OTP" });
                return;
            }

            // Mark the user as verified
            const updatedUser = user.role === "jobSeeker"
                ? await this.jobSeekerRepo.update(user.id, { isEmailVerified: true })
                : await this.recruiterRepo.update(user.id, { isEmailVerified: true });

            console.log("[VerifyOtpController] User verified successfully:", {
                id: updatedUser?.id,
                email: updatedUser?.email,
            });

            const redirectUrl = this.getRedirectUrl(user.role);

            res.status(200).json({
                user: mapUserToVerifyOtpResponse(updatedUser!),
                redirectUrl,
            });
        } catch (error: any) {
            console.error("[VerifyOtpController] Error:", error.message);
            res.status(500).json({ message: error.message || "OTP verification failed" });
        }
    }

    private getRedirectUrl(role: string): string {
        switch (role) {
            case "jobSeeker":
                return "/job-seeker/profile";
            case "recruiter":
                return "/recruiter/profile";
            case "admin":
                return "/admin/dashboard";
            default:
                return "/";
        }
    }
}
