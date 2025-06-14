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
      const { email, password, role, name, phone, company }: RegisterRequestDto = req.body;
      if (!email || !password || !role) {
        res.status(400).json({ message: 'Email, password, and role are required' });
        return;
      }
      if (role === 'jobSeeker' && !name) {
        res.status(400).json({ message: 'Name is required for job seekers' });
        return;
      }
      if (role === 'recruiter' && (!company || !company.name)) {
        res.status(400).json({ message: 'Company name is required for recruiters' });
        return;
      }

      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ message: 'Email already exists' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userData = { email, password: hashedPassword, role, name, phone, company };
      await this.otpService.generateOtp(email, userData);
      res.status(201).json({ message: 'User registered, OTP sent to email', email } as RegisterResponseDto);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Registration failed' });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp }: VerifyOtpRequestDto = req.body;
      if (!email || !otp) {
        res.status(400).json({ message: 'Email and OTP are required' });
        return;
      }

      const isValid = await this.otpService.verifyOtp(email, otp);
      console.log('otp',otp);
      
      if (!isValid) {
        res.status(400).json({ message: 'Invalid or expired OTP' });
        return;
      }

      const tempUser = await this.otpService.getTempUser(email);
      if (!tempUser) {
        res.status(404).json({ message: 'Temporary user data not found' });
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

      const user = await this.registerUserUseCase.execute(userData);
      if (!user.id) {
        throw new Error('Failed to create user: user ID is missing');
      }

      await this.otpService.deleteTempUser(email);

      const accessToken = this.jwtService.generateAccessToken(user);
      const refreshToken = await this.jwtService.generateRefreshToken(user);

      res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 60 * 60 * 1000 });
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

      const redirectUrl = this.getRedirectUrl(user.role);
      res.status(200).json({
        user: { id: user.id, email: user.email, role: user.role, isEmailVerified: true, phone: user.phone },
        redirectUrl,
      } as VerifyOtpResponseDto);
    } catch (error: any) {
     if (error.message === 'Maximum OTP verification attempts exceeded. Please request a new OTP.') {
        res.status(429).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message || 'OTP verification failed' });
      }
    }
  }
  
  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
      }

      const tempUser = await this.otpService.getTempUser(email);
      if (!tempUser) {
        res.status(404).json({ message: 'Temporary user data not found. Please register again.' });
        return;
      }

      // Reuse the existing user data to generate a new OTP
      const userData = {
        email: tempUser.email,
        password: tempUser.password,
        role: tempUser.role,
        name: tempUser.name,
        phone: tempUser.phone,
        company: tempUser.company,
      };

      await this.otpService.generateOtp(email, userData);
      res.status(200).json({ message: 'OTP resent successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Failed to resend OTP' });
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
        user: { id: user.id!, email: user.email, role: user.role, isEmailVerified: true, phone: user.phone },
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