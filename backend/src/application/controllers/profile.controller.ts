import { Request, Response } from "express";
import { MongoUserRepository } from "../../infrastructure/repositories/mongo-user.repository";
import { UserRepository } from "../../domain/interfaces/user.repository.interface";
import { JwtService } from "../../infrastructure/services/jwt.service";
import { JobSeeker, Recruiter } from "../../domain/interfaces/user.interface";
import multer from "multer";
import { promises as fs } from "fs";
import path from "path";

const upload = multer({ storage: multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
}) });

interface ProfileResponseDto {
  user: {
    id: string;
    email: string;
    role: string;
    name?: string;
    phone?: string;
    bio?: string;
    skills?: string[];
    resumeUrl?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    experience?: { company: string; role: string; years: number }[];
    profilePictureUrl?: string;
    company?: {
      name: string;
      logoUrl?: string;
      description?: string;
      website?: string;
      industry?: string;
      location?: string;
    };
  };
}

interface UpdateProfileRequestDto {
  name?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  resumeUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  experience?: { company: string; role: string; years: number }[];
  profilePictureUrl?: string;
  company?: {
    name?: string;
    logoUrl?: string;
    description?: string;
    website?: string;
    industry?: string;
    location?: string;
  };
}

export class ProfileController {
  private readonly userRepository: UserRepository;
  private readonly jwtService: JwtService;

  constructor() {
    this.userRepository = new MongoUserRepository();
    this.jwtService = new JwtService();
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const token = req.cookies.accessToken;
      if (!token) {
        res.status(401).json({ message: "No access token provided" });
        return;
      }

      const decoded = this.jwtService.verifyAccessToken(token);
      if (!decoded || !decoded.id) {
        res.status(401).json({ message: "Invalid token" });
        return;
      }

      const user = await this.userRepository.findById(decoded.id);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      if (user.role !== "recruiter" && user.role !== "jobSeeker") {
        res.status(403).json({ message: "Unauthorized role" });
        return;
      }

      console.log("[GetProfile] Retrieved user:", {
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const responseUser: ProfileResponseDto["user"] = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
      };

      if (user.role === "jobSeeker") {
        const jobSeeker = user as JobSeeker;
        responseUser.bio = jobSeeker.bio;
        responseUser.skills = jobSeeker.skills;
        responseUser.resumeUrl = jobSeeker.resumeUrl;
        responseUser.githubUrl = jobSeeker.githubUrl;
        responseUser.linkedinUrl = jobSeeker.linkedinUrl;
        responseUser.experience = jobSeeker.experience;
        responseUser.profilePictureUrl = jobSeeker.profilePictureUrl;
      } else if (user.role === "recruiter") {
        const recruiter = user as Recruiter;
        responseUser.company = recruiter.company;
      }

      res.status(200).json({ user: responseUser } as ProfileResponseDto);
    } catch (error: any) {
      console.error("[GetProfile] Error:", error.message);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const token = req.cookies.accessToken;
      if (!token) {
        res.status(401).json({ message: "No access token provided" });
        return;
      }

      const decoded = this.jwtService.verifyAccessToken(token);
      if (!decoded || !decoded.id) {
        res.status(401).json({ message: "Invalid token" });
        return;
      }

      const user = await this.userRepository.findById(decoded.id);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      if (user.role !== "recruiter" && user.role !== "jobSeeker") {
        res.status(403).json({ message: "Unauthorized role" });
        return;
      }

      const { name, phone, bio, skills, resumeUrl, githubUrl, linkedinUrl, experience } = req.body as UpdateProfileRequestDto;
      const updateData: Partial<UpdateProfileRequestDto> = {
        name,
        phone,
      };

      if (user.role === "jobSeeker") {
        updateData.bio = bio;
        updateData.skills = skills;
        updateData.resumeUrl = resumeUrl;
        updateData.githubUrl = githubUrl;
        updateData.linkedinUrl = linkedinUrl;
        updateData.experience = experience;
      } else if (user.role === "recruiter") {
        updateData.company = req.body.company;
      }

      console.log("[UpdateProfile] Update data:", {
        id: user.id,
        email: user.email,
        role: user.role,
        updateData,
      });

      const updatedUser = await this.userRepository.update(user.id, updateData);
      if (!updatedUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const responseUser: ProfileResponseDto["user"] = {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        name: updatedUser.name,
        phone: updatedUser.phone,
      };

      if (updatedUser.role === "jobSeeker") {
        const jobSeeker = updatedUser as JobSeeker;
        responseUser.bio = jobSeeker.bio;
        responseUser.skills = jobSeeker.skills;
        responseUser.resumeUrl = jobSeeker.resumeUrl;
        responseUser.githubUrl = jobSeeker.githubUrl;
        responseUser.linkedinUrl = jobSeeker.linkedinUrl;
        responseUser.experience = jobSeeker.experience;
        responseUser.profilePictureUrl = jobSeeker.profilePictureUrl;
      } else if (updatedUser.role === "recruiter") {
        const recruiter = updatedUser as Recruiter;
        responseUser.company = recruiter.company;
      }

      res.status(200).json({ user: responseUser } as ProfileResponseDto);
    } catch (error: any) {
      console.error("[UpdateProfile] Error:", error.message);
      res.status(500).json({ message: "Failed to update profile" });
    }
  }

  async uploadProfilePicture(req: Request, res: Response): Promise<void> {
    try {
      const token = req.cookies.accessToken;
      if (!token) {
        res.status(401).json({ message: "No access token provided" });
        return;
      }

      const decoded = this.jwtService.verifyAccessToken(token);
      if (!decoded || !decoded.id) {
        res.status(401).json({ message: "Invalid token" });
        return;
      }

      const user = await this.userRepository.findById(decoded.id);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      if (user.role !== "jobSeeker" && user.role !== "recruiter") {
        res.status(403).json({ message: "Unauthorized role" });
        return;
      }

      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      const updateData: Partial<UpdateProfileRequestDto> = {
        profilePictureUrl: `/uploads/${req.file.filename}`,
      };

      const updatedUser = await this.userRepository.update(user.id, updateData);
      if (!updatedUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const responseUser: ProfileResponseDto["user"] = {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        name: updatedUser.name,
        phone: updatedUser.phone,
        profilePictureUrl: updatedUser.profilePictureUrl,
      };

      if (updatedUser.role === "jobSeeker") {
        const jobSeeker = updatedUser as JobSeeker;
        responseUser.bio = jobSeeker.bio;
        responseUser.skills = jobSeeker.skills;
        responseUser.resumeUrl = jobSeeker.resumeUrl;
        responseUser.githubUrl = jobSeeker.githubUrl;
        responseUser.linkedinUrl = jobSeeker.linkedinUrl;
        responseUser.experience = jobSeeker.experience;
      } else if (updatedUser.role === "recruiter") {
        const recruiter = updatedUser as Recruiter;
        responseUser.company = recruiter.company;
      }

      res.status(200).json({ user: responseUser } as ProfileResponseDto);
    } catch (error: any) {
      console.error("[UploadProfilePicture] Error:", error.message);
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  }
}

export default upload;