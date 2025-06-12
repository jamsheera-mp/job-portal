import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../domain/use-cases/register-user.use-case';
import { MongoUserRepository } from '../../infrastructure/repositories/user.repository';
import { JwtService } from '../../infrastructure/services/jwt.service';
import { OtpService } from '../../infrastructure/services/otp.service';
import { RegisterRequestDto, RegisterResponseDto, VerifyOtpRequestDto, VerifyOtpResponseDto, LoginRequestDto, LoginResponseDto } from '../dtos/auth.dto';
import bcrypt from 'bcryptjs';

export class AuthController {
  private readonly registerUserUseCase: RegisterUserUseCase;
  private readonly userRepository: MongoUserRepository;
  private readonly otpService: OtpService;
  private readonly jwtService: JwtService;

  constructor() {
    this.userRepository = new MongoUserRepository();
    this.registerUserUseCase = new RegisterUserUseCase(this.userRepository);
    this.otpService = new OtpService();
    this.jwtService = new JwtService();
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, role, name, company }: RegisterRequestDto = req.body;
      if (!email || !password || !role) {
        res.status(400).json({ message: 'Email, password, and role are required' });
        return;
      }
      if (role === 'jobSeeker' && !name) {
        res.status(400).json({ message: 'Name is required for job seekers' });
        return;
      }

      const userData = { email, password, role, name, company, isEmailVerified: false };
      const user = await this.registerUserUseCase.execute(userData);
      await this.otpService.generateOtp(user.id!);
      res.status(201).json({ message: 'User registered, OTP sent to email', userId: user.id } as RegisterResponseDto);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Registration failed' });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { userId, otp }: VerifyOtpRequestDto = req.body;
      if (!userId || !otp) {
        res.status(400).json({ message: 'User ID and OTP are required' });
        return;
      }

      const isValid = await this.otpService.verifyOtp(userId, otp);
      if (!isValid) {
        res.status(400).json({ message: 'Invalid or expired OTP' });
        return;
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      await this.userRepository.update(userId, { isEmailVerified: true });
      const accessToken = this.jwtService.generateAccessToken(user);
      const refreshToken = await this.jwtService.generateRefreshToken(user);

      res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 60 * 60 * 1000 });
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

      const redirectUrl = this.getRedirectUrl(user.role);
      res.status(200).json({
        user: { id: user.id!, email: user.email, role: user.role, isEmailVerified: true },
        redirectUrl,
      } as VerifyOtpResponseDto);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'OTP verification failed' });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequestDto = req.body;
      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }

      const user = await this.userRepository.findByEmail(email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      if (!user.isEmailVerified) {
        await this.otpService.generateOtp(user.id!);
        res.status(403).json({ message: 'Email not verified, OTP sent', userId: user.id });
        return;
      }

      const accessToken = this.jwtService.generateAccessToken(user);
      const refreshToken = await this.jwtService.generateRefreshToken(user);

      res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 60 * 60 * 1000 });
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

      const redirectUrl = this.getRedirectUrl(user.role);
      res.status(200).json({
        user: { id: user.id!, email: user.email, role: user.role, isEmailVerified: true },
        redirectUrl,
      } as LoginResponseDto);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Login failed' });
    }
  }

  private getRedirectUrl(role: string): string {
    switch (role) {
      case 'jobSeeker':
        return '/job-seeker/profile';
      case 'recruiter':
        return '/recruiter/profile';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  }
}