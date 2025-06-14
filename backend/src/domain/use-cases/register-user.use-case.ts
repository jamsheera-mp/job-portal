import { UserRepository } from '../interfaces/user.repository.interface';
import { UserEntity, JobSeekerEntity, RecruiterEntity, AdminEntity } from '../entities/user.entity';
import { User } from '../interfaces/user.interface';

export class RegisterUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(data: Partial<User>): Promise<User> {
    console.log('RegisterUserUseCase: Creating user with data:', data);

    let userEntity: UserEntity;

    switch (data.role) {
      case 'jobSeeker':
        userEntity = JobSeekerEntity.create(data);
        break;
      case 'recruiter':
        userEntity = RecruiterEntity.create(data);
        break;
      case 'admin':
        userEntity = AdminEntity.create(data);
        break;
      default:
        throw new Error('Invalid role');
    }

    const existingUser = await this.userRepository.findByEmail(data.email!);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const user = await this.userRepository.create(userEntity.getData());
    console.log('RegisterUserUseCase: Created user:', user);
    return user;
  }
}