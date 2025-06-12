export interface RegisterRequestDto {
  email: string;
  password: string;
  role: 'jobSeeker' | 'recruiter' | 'admin';
  name?: string;
  company?: { name: string; logoUrl?: string; description?: string; website?: string; industry?: string; location?: string };
}

export interface RegisterResponseDto {
  message: string;
}

export interface VerifyOtpRequestDto {
  userId: string;
  otp: string;
}

export interface VerifyOtpResponseDto {
  user: { id: string; email: string; role: string; isEmailVerified: boolean };
  redirectUrl: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  user: { id: string; email: string; role: string; isEmailVerified: boolean };
  redirectUrl: string;
}