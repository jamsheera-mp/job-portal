
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
    name?: string;
  };
  redirectUrl: string;
}
