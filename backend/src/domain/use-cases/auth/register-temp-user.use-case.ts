import { TempUserEntity } from "../../entities/temp-user.entity";
import { TempUserRepository } from "../../repositories/temp-user.repository.interface";
import { generateOtp } from "../../../infrastructure/utils/otp.util";
import { TempUser } from "../../interfaces/temp-user.interface";

export class RegisterTempUserUseCase {
  constructor(private tempUserRepository: TempUserRepository) {}

  async execute(data: Partial<TempUser>): Promise<TempUser> {
    console.log(`[RegisterTempUserUseCase] Starting registration for email: ${data.email}`);

    if (!data.email || !data.password || !data.role) {
      console.warn(`[RegisterTempUserUseCase] Missing required fields`);
      throw new Error("Email, password, and role are required");
    }

    const existing = await this.tempUserRepository.findByEmail(data.email);
    if (existing) {
      console.warn(`[RegisterTempUserUseCase] Email already registered: ${data.email}`);
      throw new Error("Email already registered");
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    console.log(`[RegisterTempUserUseCase] Generated OTP for ${data.email}: ${otp} (expires at ${otpExpires.toISOString()})`);

    const entity = TempUserEntity.create({
      ...data,
      otp,
      otpExpires,
    });

    const savedUser = await this.tempUserRepository.create(entity.getData());

    console.log(`[RegisterTempUserUseCase] Temp user created successfully for email: ${savedUser.email}`);
    return savedUser;
  }
}
