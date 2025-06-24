
import { JobSeeker } from "../../domain/interfaces/jobseeker.interface";
import { RegisterRequestDto } from "../dtos/auth/register.dto";

export const mapRegisterDtoToJobSeeker = (
  dto: RegisterRequestDto,
  hashedPassword: string
): JobSeeker => ({
    email: dto.email,
    password: hashedPassword,
    role: 'jobSeeker',
    name: dto.name!,
    phone: dto.phone,
    isEmailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    id: ""
});
