

import { User } from './user.interface';
import { Company } from './company.interface';

export interface Recruiter extends User {
  company: Company; 
  
}
