import { Injectable } from '@nestjs/common';
import { FirstAidRepository } from './repositories/firstAid.repository';

@Injectable()
export class FirstAidService {
  constructor(private readonly firstAidRepository: FirstAidRepository) {}

  async findOneByCode(code: string) {
    return await this.firstAidRepository.findOneByCode(code);
  }
}
