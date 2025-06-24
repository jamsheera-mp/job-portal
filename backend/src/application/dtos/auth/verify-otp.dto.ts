
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
