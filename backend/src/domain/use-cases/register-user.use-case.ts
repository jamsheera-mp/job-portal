import { UserRepository } from '../interfaces/user.repository.interface';
import { UserEntity} from '../entities/user.entity';
import { JobSeekerEntity } from '../entities/jobseeker.entity';
import { RecruiterEntity } from '../entities/recruiter.entity';
import { AdminEntity } from '../entities/admin.entity';
import { User } from '../interfaces/user.interface';


export class RegisterUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(data: Partial<User>): Promise<User> {
    try {
      console.log('[RegisterUserUseCase] Input data:', {
        email: data.email,
        role: data.role,
        name: data.name,
        phone: data.phone,
        hasPassword: !!data.password,
      });

      if (!data.email || !data.password || !data.role) {
        throw new Error('Email, password, and role are required');
      }

      const userData: Partial<User> = {
        ...data,
        isEmailVerified: data.isEmailVerified ?? false,
        isBlocked: data.isBlocked ?? false,
        createdAt: data.createdAt ?? new Date(),
        updatedAt: data.updatedAt ?? new Date(),
      };

      let userEntity: UserEntity;

      switch (data.role) {
        case 'jobSeeker':
          userEntity = JobSeekerEntity.create(userData);
          break;
        case 'recruiter':
          userEntity = RecruiterEntity.create(userData);
          break;
        case 'admin':
          userEntity = AdminEntity.create(userData);
          break;
        default:
          throw new Error('Invalid role');
      }

      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        console.log('[RegisterUserUseCase] Email already exists:', data.email);
        throw new Error('Email already exists');
      }

      const user = await this.userRepository.create(userEntity.getData());
      console.log('[RegisterUserUseCase] Created user:', {
        id: user.id,
        email: user.email,
        role: user.role,
        hasPassword: !!user.password,
      });

      return user;
    } catch (error: any) {
      console.error('[RegisterUserUseCase] Error:', error.message);
      throw new Error(`Failed to register user: ${error.message}`);
    }
  }
}