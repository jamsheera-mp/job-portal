import { Document } from "mongoose";
import { User, JobSeeker, Recruiter, Admin } from "../../domain/interfaces/user.interface";
import { UserRepository } from "../../domain/interfaces/user.repository.interface";
import { JobSeekerModel, RecruiterModel, AdminModel } from "../database/user.schema";

// Helper function to transform MongoDB document to User interface
const transformToUser = (doc: any): User => {
  if (!doc || !doc._id) {
    throw new Error("Invalid document: _id is missing");
  }
  const user = {
    ...doc,
    id: doc._id.toString(),
  };
  delete user._id;
  delete user.__v;
  return user as User;
};

export class MongoUserRepository implements UserRepository {
  async create(user: User): Promise<User> {
    try {
      let createdUser: any;
      switch (user.role) {
        case "jobSeeker":
          createdUser = await JobSeekerModel.create(user as JobSeeker);
          break;
        case "recruiter":
          createdUser = await RecruiterModel.create(user as Recruiter);
          break;
        case "admin":
          createdUser = await AdminModel.create(user as Admin);
          break;
        default:
          throw new Error("Invalid role");
      }
      return transformToUser(createdUser.toObject());
    } catch (error: any) {
      console.error("Error creating user in MongoDB:", error.message);
      throw new Error(`Failed to create user in MongoDB: ${error.message}`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      let user = await JobSeekerModel.findOne({ email }).lean();
      if (user) return transformToUser(user);
      user = await RecruiterModel.findOne({ email }).lean();
      if (user) return transformToUser(user);
      user = await AdminModel.findOne({ email }).lean();
      if (user) return transformToUser(user);
      return null;
    } catch (error: any) {
      console.error("Error finding user by email:", error.message);
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      let user = await JobSeekerModel.findById(id).lean();
      if (user) return transformToUser(user);
      user = await RecruiterModel.findById(id).lean();
      if (user) return transformToUser(user);
      user = await AdminModel.findById(id).lean();
      if (user) return transformToUser(user);
      return null;
    } catch (error: any) {
      console.error("Error finding user by ID:", error.message);
      throw new Error(`Failed to find user by ID: ${error.message}`);
    }
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    try {
      let user = await JobSeekerModel.findById(id).lean();
      if (user) {
        const updatedUser = await JobSeekerModel.findByIdAndUpdate(
          id,
          { ...data, updatedAt: new Date() },
          { new: true }
        ).lean();
        return updatedUser ? transformToUser(updatedUser) : null;
      }

      user = await RecruiterModel.findById(id).lean();
      if (user) {
        const updatedUser = await RecruiterModel.findByIdAndUpdate(
          id,
          { ...data, updatedAt: new Date() },
          { new: true }
        ).lean();
        return updatedUser ? transformToUser(updatedUser) : null;
      }

      user = await AdminModel.findById(id).lean();
      if (user) {
        const updatedUser = await AdminModel.findByIdAndUpdate(
          id,
          { ...data, updatedAt: new Date() },
          { new: true }
        ).lean();
        return updatedUser ? transformToUser(updatedUser) : null;
      }

      return null;
    } catch (error: any) {
      console.error("Error updating user:", error.message);
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const jobSeekers = await JobSeekerModel.find().lean();
      const recruiters = await RecruiterModel.find().lean();
      const admins = await AdminModel.find().lean();
      const users = [...jobSeekers, ...recruiters, ...admins].map(transformToUser);
      return users;
    } catch (error: any) {
      console.error("Error finding all users:", error.message);
      throw new Error(`Failed to find all users: ${error.message}`);
    }
  }

  async delete(id: string): Promise<User | null> {
    try {
      let user = await JobSeekerModel.findById(id).lean();
      if (user) {
        const deletedUser = await JobSeekerModel.findByIdAndDelete(id).lean();
        return deletedUser ? transformToUser(deletedUser) : null;
      }

      user = await RecruiterModel.findById(id).lean();
      if (user) {
        const deletedUser = await RecruiterModel.findByIdAndDelete(id).lean();
        return deletedUser ? transformToUser(deletedUser) : null;
      }

      user = await AdminModel.findById(id).lean();
      if (user) {
        const deletedUser = await AdminModel.findByIdAndDelete(id).lean();
        return deletedUser ? transformToUser(deletedUser) : null;
      }

      return null;
    } catch (error: any) {
      console.error("Error deleting user:", error.message);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}