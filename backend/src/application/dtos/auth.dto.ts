export interface RegisterRequestDto {
  email: string;
  password: string;
  role: 'jobSeeker' | 'recruiter' | 'admin';
  name?: string;
  phone?: string;
  company?: {
    name: string;
    logoUrl?: string;
    description?: string;
    website?: string;
    industry?: string;
    location?: string;
  };
}

export interface RegisterResponseDto {
  message: string;
  email: string; 
}

export interface VerifyOtpRequestDto {
  email: string; 
  otp: string;
  
}

export interface VerifyOtpResponseDto {
  user: {
    id: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
    phone?: string;
  };
  redirectUrl: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  user: {
    id: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
    phone?: string;
  };
  redirectUrl: string;
}