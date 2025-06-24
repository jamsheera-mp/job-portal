import { Request, Response } from "express";
import { MongoJobSeekerRepository } from "../../../infrastructure/repositories/mongo-jobseeker.repository";
import { MongoRecruiterRepository } from "../../../infrastructure/repositories/mongo-recruiter.repository";
import { OtpService } from "../../../infrastructure/services/otp.service";
import bcrypt from "bcryptjs";
import { RegisterResponseDto } from "../../dtos/auth/register.dto";

export class RegisterController {
  private jobSeekerRepo = new MongoJobSeekerRepository();
  private recruiterRepo = new MongoRecruiterRepository();
  private otpService = new OtpService();

  async register(req: Request, res: Response): Promise<void> {
    try {
      console.log("[RegisterController] Registration request received");

      const { email, password, role, name, phone, company } = req.body;

      if (!email || !password || !role) {
        console.warn("[RegisterController] Missing required fields");
        res.status(400).json({ message: "Email, password, and role are required" });
        return;
      }

      if (role === "jobSeeker" && !name) {
        console.warn("[RegisterController] Name missing for jobSeeker");
        res.status(400).json({ message: "Name is required for job seekers" });
        return;
      }

      if (role === "recruiter" && (!company || !company.name)) {
        console.warn("[RegisterController] Company name missing for recruiter");
        res.status(400).json({ message: "Company name is required for recruiters" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      let newUser;

      if (role === "jobSeeker") {
        const existing = await this.jobSeekerRepo.findByEmail(email);
        if (existing) {
          console.warn("[RegisterController] JobSeeker already exists:", email);
          res.status(400).json({ message: "Email already registered" });
          return;
        }

        newUser = await this.jobSeekerRepo.create({
          email,
          password: hashedPassword,
          role,
          name,
          phone,
          isEmailVerified: false,
          id: "", // Mongoose will override this
        });
      } else if (role === "recruiter") {
        const existing = await this.recruiterRepo.findByEmail(email);
        if (existing) {
          console.warn("[RegisterController] Recruiter already exists:", email);
          res.status(400).json({ message: "Email already registered" });
          return;
        }

        newUser = await this.recruiterRepo.create({
          email,
          password: hashedPassword,
          role,
          name,
          phone,
          company,
          isEmailVerified: false,
          id: "", // Mongoose will override this
        });
      } else {
        console.warn("[RegisterController] Invalid role provided:", role);
        res.status(400).json({ message: "Invalid role" });
        return;
      }

      await this.otpService.generateOtp(newUser.id, email);
      console.log(`[RegisterController] OTP sent for user: ${newUser.id}`);
      res.status(201).json({ message: "OTP sent to email", userId: newUser.id } as RegisterResponseDto);

    } catch (error: any) {
      console.error("[RegisterController] Error:", error.message);
      res.status(500).json({ message: error.message || "Registration failed" });
    }
  }
}
