import { Request, Response } from "express";
import { MongoUserRepository } from "../../infrastructure/repositories/user.repository";
import { JwtService } from "../../infrastructure/services/jwt.service";
import { JobSeeker, Recruiter, Admin, User } from "../../domain/interfaces/user.interface";

export class AdminController {
  private readonly userRepository: MongoUserRepository;
  private readonly jwtService: JwtService;

  constructor() {
    this.userRepository = new MongoUserRepository();
    this.jwtService = new JwtService();
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.jwtService.verifyAccessToken(req.cookies.accessToken);
      if (!user || user.role !== "admin") {
        res.status(403).json({ message: "Access denied. Admin role required" });
        return;
      }
      const users = await this.userRepository.findAll();
      res.status(200).json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch users" });
    }
  }

  async editUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.jwtService.verifyAccessToken(req.cookies.accessToken);
      if (!user || user.role !== "admin") {
        res.status(403).json({ message: "Access denied. Admin role required" });
        return;
      }
      const { id } = req.params;
      const { email, role, name, phone, company, bio, skills, resumeUrl, githubUrl, linkedinUrl, experience, profilePictureUrl } = req.body;
      const data: Partial<JobSeeker | Recruiter | Admin> = { email, role, name, phone, company, bio, skills, resumeUrl, githubUrl, linkedinUrl, experience, profilePictureUrl };
      const updatedUser = await this.userRepository.update(id, data);
      if (!updatedUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.status(200).json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update user" });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.jwtService.verifyAccessToken(req.cookies.accessToken);
      if (!user || user.role !== "admin") {
        res.status(403).json({ message: "Access denied. Admin role required" });
        return;
      }
      const { id } = req.params;
      const deletedUser = await this.userRepository.delete(id);
      if (!deletedUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to delete user" });
    }
  }

  async addUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.jwtService.verifyAccessToken(req.cookies.accessToken);
      if (!user || user.role !== "admin") {
        res.status(403).json({ message: "Access denied. Admin role required" });
        return;
      }
      const { email, password, role, name, phone, company } = req.body;
      if (!email || !password || !role) {
        res.status(400).json({ message: "Email, password, and role are required" });
        return;
      }
      const data: Partial<User> = { email, password, role };
      if (role === "jobSeeker") {
        if (!name || !phone) {
          res.status(400).json({ message: "Name and phone are required for job seekers" });
          return;
        }
        data.name = name;
        data.phone = phone;
      } else if (role === "recruiter") {
        if (!company?.name) {
          res.status(400).json({ message: "Company name is required for recruiters" });
          return;
        }
        data.company = company;
      }
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ message: "User with this email already exists" });
        return;
      }
      const newUser = await this.userRepository.create(data);
      res.status(201).json(newUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to add user" });
    }
  }
}