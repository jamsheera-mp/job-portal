import { JobSeeker } from "../../domain/interfaces/jobseeker.interface";
import { Recruiter } from "../../domain/interfaces/recruiter.interface";
import { VerifyOtpResponseDto } from "../dtos/auth.dto";




export const mapUserToVerifyOtpResponse = (
  user: JobSeeker | Recruiter
): VerifyOtpResponseDto["user"] => ({
  id: user.id, 
  email: user.email,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  phone: user.phone,
});



