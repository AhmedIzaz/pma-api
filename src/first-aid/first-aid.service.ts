import { Injectable } from '@nestjs/common';
import { FirstAidRepository } from './repositories/firstAid.repository';
import { QueryRunner } from 'typeorm';

@Injectable()
export class FirstAidService {
  constructor(private readonly firstAidRepository: FirstAidRepository) {}

  async findOneByCode(code: string) {
    return await this.firstAidRepository.findOneByCode(code);
  }

  async create(code: string, description: any, queryRunner?: QueryRunner) {
    return await this.firstAidRepository.create({ code, description }, queryRunner);
  }
}
