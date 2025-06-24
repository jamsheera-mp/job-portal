export interface User {
  id: string;
  email: string;
  password: string;
  role: "jobSeeker" | "recruiter" | "admin";
  phone?: string;
  isBlocked?: boolean;
  isEmailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JobSeeker extends User {
  name?: string;
  bio?: string;
  skills?: string[];
  resumeUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  experience?: { company: string; role: string; years: number }[];
  profilePictureUrl?: string;
}

export interface Recruiter extends User {
  company?: {
    name: string;
    logoUrl?: string;
    description?: string;
    website?: string;
    industry?: string;
    location?: string;
  };
}

export interface Admin extends User {}