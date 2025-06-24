import { JobSeekerEntity } from "../../entities/jobseeker.entity";
import { RecruiterEntity } from "../../entities/recruiter.entity";
import { User } from "../../interfaces/user.interface";
import { JobSeekerRepository } from "../../repositories/jobseeker.repository.interface";
import { RecruiterRepository } from "../../repositories/recruiter.repository.interface";
import { TempUserRepository } from "../../repositories/temp-user.repository.interface";

export class VerifyOtpUseCase {
  constructor(
    private tempUserRepository: TempUserRepository,
    private jobSeekerRepository: JobSeekerRepository,
    private recruiterRepository: RecruiterRepository
  ) {}

  async execute(email: string, otp: string): Promise<User> {
    console.log(`[VerifyOtpUseCase] Starting OTP verification for email: ${email}`);

    const tempUser = await this.tempUserRepository.findByEmail(email);
    if (!tempUser) {
      console.warn(`[VerifyOtpUseCase] No temp user found for email: ${email}`);
      throw new Error("User not found");
    }

    console.log(`[VerifyOtpUseCase] Temp user found. Checking OTP validity`);

    if (tempUser.otp !== otp) {
      console.warn(`[VerifyOtpUseCase] Invalid OTP for email: ${email}`);
      throw new Error("Incorrect OTP");
    }

    if (tempUser.otpExpires < new Date()) {
      console.warn(`[VerifyOtpUseCase] OTP expired for email: ${email}`);
      throw new Error("OTP has expired");
    }

    let newUser: User;

    switch (tempUser.role) {
      case "jobSeeker":
        console.log(`[VerifyOtpUseCase] Creating job seeker account for email: ${email}`);
        newUser = await this.jobSeekerRepository.create(
          JobSeekerEntity.create(tempUser).getData()
        );
        break;

      case "recruiter":
        console.log(`[VerifyOtpUseCase] Creating recruiter account for email: ${email}`);
        newUser = await this.recruiterRepository.create(
          RecruiterEntity.create(tempUser).getData()
        );
        break;

      default:
        console.error(`[VerifyOtpUseCase] Invalid role: ${tempUser.role}`);
        throw new Error("Invalid user role");
    }

    console.log(`[VerifyOtpUseCase] Deleting temp user record for email: ${email}`);
    await this.tempUserRepository.deleteByEmail(email);

    console.log(`[VerifyOtpUseCase] User account created successfully. Role: ${tempUser.role}, ID: ${newUser.id}`);
    return newUser;
  }
}
