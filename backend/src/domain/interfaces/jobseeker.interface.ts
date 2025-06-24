
import { User } from './user.interface'


export interface JobSeeker extends User {
 
  bio?: string;
  skills?: string[];
  resumeUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  experience?: { company: string; role: string; years: number }[];
  profilePictureUrl?: string;
}