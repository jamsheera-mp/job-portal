import { Admin } from '../interfaces/admin.interface';
import { UserEntity } from './user.entity';

export class AdminEntity extends UserEntity {
  constructor(private admin: Admin) {
    super(admin);
  }

  static create(data: Partial<Admin>): AdminEntity {
    const base = UserEntity.create(data).getData();
    return new AdminEntity(base as Admin);
  }
}
