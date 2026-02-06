import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FirstAidEntity } from '../entities/first-aid.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FirstAidRepository {
  constructor(
    @InjectRepository(FirstAidEntity)
    private readonly firstAidRepository: Repository<FirstAidEntity>,
  ) {}

  async findOneByCode(code: string) {
    return await this.firstAidRepository.findOneBy({ code });
  }
}
