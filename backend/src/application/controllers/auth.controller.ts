import { Request, Response } from "express";
import { RegisterUserUseCase } from "../../domain/use-cases/register-user.use-case";
import { MongoUserRepository } from "../../infrastructure/repositories/mongo-user.repository";
import { JwtService } from "../../infrastructure/services/jwt.service";
import { OtpService } from "../../infrastructure/services/otp.service";
import {
  RegisterRequestDto,
  RegisterResponseDto,
  VerifyOtpRequestDto,
  VerifyOtpResponseDto,
  LoginRequestDto,
  LoginResponseDto,
} from "../dtos/auth.dto";
import bcrypt from "bcryptjs";
import { ResetPasswordUseCase } from "../../domain/use-cases/reset-password.use-case";

export class AuthController {
  private readonly registerUserUseCase: RegisterUserUseCase;
  private readonly resetPasswordUseCase: ResetPasswordUseCase;
  private readonly userRepository: MongoUserRepository;
  private readonly otpService: OtpService;
  private readonly jwtService: JwtService;

  constructor() {
    this.userRepository = new MongoUserRepository();
    this.otpService = new OtpService(this.userRepository);
    this.registerUserUseCase = new RegisterUserUseCase(this.userRepository);
    this.resetPasswordUseCase = new ResetPasswordUseCase(this.userRepository, this.otpService);
    this.jwtService = new JwtService();
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const {
        email,
        password,
        role,
        name,
        phone,
        company,
      }: RegisterRequestDto = req.body;
      if (!email || !password || !role) {
        res.status(400).json({ message: "Email, password, and role are required" });
        return;
      }
      if (role === "jobSeeker" && !name) {
        res.status(400).json({ message: "Name is required for job seekers" });
        return;
      }
      if (role === "recruiter" && (!company || !company.name)) {
        res.status(400).json({ message: "Company name is required for recruiters" });
        return;
      }

      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ message: "Email already exists" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userData = {
        email,
        password: hashedPassword,
        role,
        name,
        phone,
        company,
      };
      await this.otpService.generateOtp(email, userData);
      res.status(201).json({
        message: "User registered, OTP sent to email",
        email,
      } as RegisterResponseDto);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp }: VerifyOtpRequestDto = req.body;
      console.log("[VerifyOtp] Request body:", { email, otp });
      if (!email || !otp) {
        res.status(400).json({ message: "Email and OTP are required" });
        return;
      }

      const isValid = await this.otpService.verifyOtp(email, otp);
      console.log("otp", otp);

      if (!isValid) {
        res.status(400).json({ message: "Invalid or expired OTP" });
        return;
      }

     
        const tempUser = await this.otpService.getTempUser(email);
        console.log("[VerifyOtp] Retrieved temp user:", {
          email: tempUser?.email,
          role: tempUser?.role,
          hasPassword: !!tempUser?.password,
        });
        if (!tempUser) {
          res.status(404).json({ message: "User data not found" });
          return;
        }

        const userData = {
          email: tempUser.email,
          password: tempUser.password,
          role: tempUser.role,
          name: tempUser.name,
          phone: tempUser.phone,
          company: tempUser.company,
          isEmailVerified: true,
        };

        console.log("[VerifyOtp] User data for registration:", {
          email: userData.email,
          role: userData.role,
          hasPassword: !!userData.password,
        });

        const user = await this.registerUserUseCase.execute(userData);
        console.log("[VerifyOtp] Created user:", {
          id: user?.id,
          email: user?.email,
          role: user?.role,
        });
        if (!user.id) {
          console.error("[VerifyOtp] User ID missing:", user);
          throw new Error("Failed to create user: user ID is missing");
        }

        await this.otpService.deleteTempUser(email);
        console.log("[VerifyOtp] Deleted temp user for:", email);

        let accessToken, refreshToken;
        try {
          accessToken = this.jwtService.generateAccessToken(user);
          console.log("[VerifyOtp] Access token generated");
          refreshToken = await this.jwtService.generateRefreshToken(user);
          console.log("[VerifyOtp] Refresh token generated");
        } catch (error: any) {
          console.error("[VerifyOtp] Token generation error:", error.message);
          res.status(500).json({ message: "Failed to generate tokens" });
          return;
        }

        try {
          res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 1000,
          });
          res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });
          console.log("[VerifyOtp] Cookies set successfully");
        } catch (error: any) {
          console.error("[VerifyOtp] Cookie setting error:", error.message);
          res.status(500).json({ message: "Failed to set cookies" });
          return;
        }

        const redirectUrl = this.getRedirectUrl(user.role);
        console.log("[VerifyOtp] Redirecting to:", redirectUrl);
        res.status(200).json({
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            isEmailVerified: true,
            phone: user.phone,
          },
          redirectUrl,
        } as VerifyOtpResponseDto);
      
    } catch (error: any) {
      console.error("[VerifyOtp] Error:", error.message);
      if (
        error.message ===
        "Maximum OTP verification attempts exceeded. Please request a new OTP."
      ) {
        res.status(429).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message || "OTP verification failed" });
      }
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
      }

      const user = await this.userRepository.findByEmail(email);
      if (user) {
        await this.otpService.generateOtp(email, user, true);
        res.status(200).json({ message: "OTP resent successfully for password reset" });
        return;
      }

      const tempUser = await this.otpService.getTempUser(email);
      if (!tempUser) {
        res.status(404).json({
          message: "Temporary user data not found. Please register again.",
        });
        return;
      }

      const userData = {
        email: tempUser.email,
        password: tempUser.password,
        role: tempUser.role,
        name: tempUser.name,
        phone: tempUser.phone,
        company: tempUser.company,
      };

      await this.otpService.generateOtp(email, userData);
      res.status(200).json({ message: "OTP resent successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to resend OTP" });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequestDto = req.body;
      console.log("[Login] Request body:", { email, password });

      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }

      const user = await this.userRepository.findByEmail(email);
      console.log("[Login] Retrieved user:", user);

      if (!user) {
        res.status(401).json({ message: "Invalid email" });
        return;
      }

      try {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log("[Login] Password comparison result:", isPasswordValid);
        if (!isPasswordValid) {
          res.status(401).json({ message: "Invalid password" });
          return;
        }
      } catch (error: any) {
        console.error("[Login] Bcrypt comparison error:", error.message);
        res
          .status(500)
          .json({
            message: "Internal server error: Password comparison failed",
          });
        return;
      }

      if (!user.isEmailVerified) {
        await this.otpService.generateOtp(user.email, user);
        res
          .status(403)
          .json({ message: "Email not verified, OTP sent", userId: user.id });
        return;
      }

      if (!user.id) {
        console.error("[Login] User ID is missing:", user);
        res
          .status(500)
          .json({ message: "Internal server error: User ID missing" });
        return;
      }

      console.log("[Login] User object before token generation:", {
        id: user.id,
        email: user.email,
        role: user.role,
      });

      let accessToken, refreshToken;
      try {
        accessToken = this.jwtService.generateAccessToken(user);
        console.log("[Login] Access token generated");
      } catch (error: any) {
        console.error("[Login] Access token generation error:", error.message);
        res.status(500).json({ message: "Failed to generate access token" });
        return;
      }

      try {
        refreshToken = await this.jwtService.generateRefreshToken(user);
        console.log("[Login] Refresh token generated");
      } catch (error: any) {
        console.error("[Login] Refresh token generation error:", error.message);
        res.status(500).json({ message: "Failed to generate refresh token" });
        return;
      }

      try {
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 1000, // 1 hour
        });
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        console.log("[Login] Cookies set successfully");
      } catch (error: any) {
        console.error("[Login] Cookie setting error:", error.message);
        res.status(400).json({ message: "Failed to set cookies" });
        return;
      }

      const redirectUrl = this.getRedirectUrl(user.role);
      console.log("[Login] Redirecting to:", redirectUrl);

      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isEmailVerified: true,
          phone: user.phone,
          name: user.name,
        },
        redirectUrl,
      } as LoginResponseDto);
    } catch (error: any) {
      console.error("[Login] Error:", error.message);
      res.status(500).json({ message: error.message || "Login failed" });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      console.log("[Logout] Refresh token received:", refreshToken);

      if (refreshToken) {
        try {
          await this.jwtService.invalidateRefreshToken(refreshToken);
          console.log("[Logout] Refresh token invalidated");
        } catch (error: any) {
          console.error(
            "[Logout] Error invalidating refresh token:",
            error.message
          );
        }
      }

      try {
        res.clearCookie("accessToken", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        res.clearCookie("refreshToken", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        console.log("[Logout] Cookies cleared");
      } catch (error: any) {
        console.error("[Logout] Error clearing cookies:", error.message);
        res.status(500).json({ message: "Failed to clear cookies" });
        return;
      }

      res.status(200).json({ message: "Logged out successfully" });
    } catch (error: any) {
      console.error("[Logout] Error:", error.message);
      res.status(500).json({ message: "Logout failed" });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp, newPassword, confirmPassword } = req.body;
      if (!email || !otp || !newPassword || !confirmPassword) {
        res.status(400).json({ message: "Email, OTP, new password, and confirm password are required" });
        return;
      }

      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      if (newPassword !== confirmPassword) {
        res.status(400).json({ message: "Passwords do not match" });
        return;
      }

      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        res.status(400).json({ message: "Please enter a different password from the one previously used" });
        return;
      }

      const resetUseCase = new ResetPasswordUseCase(this.userRepository, this.otpService);
      const result = await resetUseCase.execute(email, otp, newPassword);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Password reset failed" });
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