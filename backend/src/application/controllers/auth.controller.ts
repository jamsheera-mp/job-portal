import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../domain/use-cases/register-user.use-case';
import { MongoUserRepository } from '../../infrastructure/repositories/user.repository';
import { JwtService } from '../../infrastructure/services/jwt.service';
import { OtpService } from '../../infrastructure/services/otp.service';
import { RegisterRequestDto, RegisterResponseDto, VerifyOtpRequestDto, VerifyOtpResponseDto, LoginRequestDto, LoginResponseDto } from '../dtos/auth.dto';
import bcrypt from 'bcryptjs';
//import passport from '../../infrastructure/auth/passport.config';

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
    console.log('[Login] Request body:', { email, password });

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await this.userRepository.findByEmail(email);
    console.log('[Login] Retrieved user:', user);

    if (!user) {
      res.status(401).json({ message: 'Invalid email' });
      return;
    }

    if (!(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Invalid password' });
      return;
    }

    if (!user.isEmailVerified) {
      await this.otpService.generateOtp(user.email, user);
      res.status(403).json({ message: 'Email not verified, OTP sent', userId: user.id });
      return;
    }

    if (!user.id) {
      console.error('[Login] User ID is missing:', user);
      res.status(500).json({ message: 'Internal server error: User ID missing' });
      return;
    }

    console.log('[Login] User object before token generation:', {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    let accessToken, refreshToken;
    try {
      accessToken = this.jwtService.generateAccessToken(user);
      console.log('[Login] Access token generated');
    } catch (error: any) {
      console.error('[Login] Access token generation error:', error.message);
      res.status(500).json({ message: 'Failed to generate access token' });
      return;
    }

    try {
      refreshToken = await this.jwtService.generateRefreshToken(user);
      console.log('[Login] Refresh token generated');
    } catch (error: any) {
      console.error('[Login] Refresh token generation error:', error.message);
      res.status(500).json({ message: 'Failed to generate refresh token' });
      return;
    }

    try {
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000, // 1 hour
      });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      console.log('[Login] Cookies set successfully');
    } catch (error: any) {
      console.error('[Login] Cookie setting error:', error.message);
      res.status(500).json({ message: 'Failed to set cookies' });
      return;
    }

    const redirectUrl = this.getRedirectUrl(user.role);
    console.log('[Login] Redirecting to:', redirectUrl);

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
    console.error('[Login] Error:', error.message);
    res.status(500).json({ message: error.message || 'Login failed' });
  }
}


async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      console.log('[Logout] Refresh token received:', refreshToken);

      if (refreshToken) {
        try {
          await this.jwtService.invalidateRefreshToken(refreshToken);
          console.log('[Logout] Refresh token invalidated');
        } catch (error: any) {
          console.error('[Logout] Error invalidating refresh token:', error.message);
        }
      }

      try {
        res.clearCookie('accessToken', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
        res.clearCookie('refreshToken', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
        console.log('[Logout] Cookies cleared');
      } catch (error: any) {
        console.error('[Logout] Error clearing cookies:', error.message);
        res.status(500).json({ message: 'Failed to clear cookies' });
        return;
      }

      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error: any) {
      console.error('[Logout] Error:', error.message);
      res.status(500).json({ message: 'Logout failed' });
    }
  }
/*
    // Google Sign-In Route
  googleAuth(req: Request, res: Response): void {
    passport.authenticate('google')(req, res);
  }

  // Google Callback Route
  async googleAuthCallback(req: Request, res: Response): Promise<void> {
    passport.authenticate('google', { session: false }, async (err, user) => {
      if (err || !user) {
        return res.redirect('http://localhost:5173/register?error=' + encodeURIComponent(err?.message || 'Google authentication failed'));
      }
      console.log('google sigin successfull');
      
      const accessToken = this.jwtService.generateAccessToken(user);
      const refreshToken = await this.jwtService.generateRefreshToken(user);

      res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 60 * 60 * 1000 });
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

      const redirectUrl = this.getRedirectUrl(user.role);
      console.log('Redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
    })(req, res);
  }
  /*

  // LinkedIn Sign-In Route
  linkedInAuth(req: Request, res: Response): void {
    passport.authenticate('linkedin')(req, res);
  }

  // LinkedIn Callback Route
  async linkedInAuthCallback(req: Request, res: Response): Promise<void> {
    passport.authenticate('linkedin', { session: false }, async (err: any, user: User | false) => {
        console.log('LinkedIn auth callback - err:', err);
        console.log('LinkedIn auth callback - user:', user);
      
      if (err || !user) {
        return res.redirect('http://localhost:5173/register?error=' + encodeURIComponent(err?.message || 'LinkedIn authentication failed'));
      }
        console.log('linkedin sigin successfull');
      const accessToken = this.jwtService.generateAccessToken(user);
      const refreshToken = await this.jwtService.generateRefreshToken(user);

      res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 60 * 60 * 1000 });
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

      const redirectUrl = this.getRedirectUrl(user.role);
      console.log('Redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
    })(req, res);
  }

  

  */
 /*
 
  // LinkedIn Sign-In Route
  linkedInAuth(req: Request, res: Response, next: NextFunction): void {
    passport.authenticate('linkedin-openid', { session: false, scope: 'openid profile email' }, (err, user, info) => {
      if (err) {
        console.error('LinkedIn auth error:', err);
        return next(err);
      }
      if (!user) {
        console.log('LinkedIn auth info:', info);
        return res.redirect(`/register?error=${encodeURIComponent(info?.message || 'Authentication failed')}`);
      }
      req.user = user; // Attach user to request
      next();
    })(req, res, next);
  }

  // LinkedIn Callback Route
  async linkedInAuthCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    const user = req.user as User;
    if (!user) {
      return res.redirect('/register?error=User not authenticated');
    }

    console.log('LinkedIn auth callback - user:', user);
    try {
      const accessToken = this.jwtService.generateAccessToken(user);
      const refreshToken = await this.jwtService.generateRefreshToken(user);

      res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 60 * 60 * 1000 });
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

      const redirectUrl = this.getRedirectUrl(user.role);
      console.log('Redirecting to:', redirectUrl);
      res.redirect(`http://localhost:5173${redirectUrl}`); // Ensure full URL
    } catch (error: any) {
      console.error('Error in callback:', error);
      next(error);
    }
  }

 */

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
  

