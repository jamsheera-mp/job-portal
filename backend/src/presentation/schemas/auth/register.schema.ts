import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(['jobSeeker', 'recruiter']),
  name: z.string().min(1, { message: "Name is required" }).optional(),
  phone: z.string().optional(),
  company: z
    .object({
      name: z.string().min(1, { message: "Company name is required" }),
      logoUrl: z.string().optional(),
      description: z.string().optional(),
      website: z.string().optional(),
      industry: z.string().optional(),
      location: z.string().optional(),
    })
    .optional(),
});
