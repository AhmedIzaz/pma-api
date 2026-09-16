import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { FirstAidEntity } from '../entities/first-aid.entity';
import { QueryRunner, Repository } from 'typeorm';
import { FirstAidEntity } from '../entities/first-aid.entity';

@Injectable()
export class FirstAidRepository {
  constructor(
    @InjectRepository(FirstAidEntity)
    private readonly firstAidRepository: Repository<FirstAidEntity>,
  ) { }

  getRepo(queryRunner?: QueryRunner) {
    return queryRunner
      ? queryRunner.manager.getRepository(FirstAidEntity)
      : this.firstAidRepository;
  }

  async findOneByCode(code: string) {
    return await this.firstAidRepository.findOneBy({ code });
  }

  async create(data: { code: string; description: any }, queryRunner?: QueryRunner) {
    const repo = this.getRepo(queryRunner);
    const entity = repo.create(data);
    return await repo.save(entity);
  }
}
