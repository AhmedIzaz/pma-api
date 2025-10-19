import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UserRepository {
  constructor(private dataSource: DataSource) {}

  private repository(manager?: EntityManager) {
    return (manager ?? this.dataSource.manager)?.getRepository(UserEntity);
  }

  async findByEmail(email: string, manager?: EntityManager) {
    return this.repository(manager)?.findOne({ where: { userEmail: email } });
  }

  async create(data: Partial<UserEntity>, manager?: EntityManager) {
    const repo = this.repository(manager);
    const instance = repo.create(data);
    return repo.save(instance);
  }
}
