import { Company } from "./company.interface";


export interface User {
  
  id: string;
  name?: string,
  email: string;
  password: string;
  role: 'jobSeeker' | 'recruiter' | 'admin';
  phone?: string;
  company?: Company;
  isBlocked?: boolean;
  isEmailVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  
}





