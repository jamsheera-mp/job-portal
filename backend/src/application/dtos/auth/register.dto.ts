

export interface RegisterRequestDto {
  email: string;
  password: string;
  role: 'jobSeeker' | 'recruiter';
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
  userId: string;
}
