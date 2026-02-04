import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PromptEntity } from '../entities/prompt.entity';
import { QueryRunner, Repository } from 'typeorm';
import { TCreatePromptInterface } from '../interfaces/createPrompt.interface';

@Injectable()
export class PromptRepository {
  constructor(
    @InjectRepository(PromptEntity)
    private readonly promptRepository: Repository<PromptEntity>,
  ) {}

  getRepo(queryRunner?: QueryRunner) {
    const repo = queryRunner
      ? queryRunner?.manager?.getRepository(PromptEntity)
      : this.promptRepository;
    return repo;
  }

  async getPromptsByUserId(userId: number) {
    return await this.promptRepository.findBy({ user: { userId } });
  }

  async create(data: TCreatePromptInterface, queryRunner?: QueryRunner) {
    const repo = this.getRepo(queryRunner);
    const { userId, text, generatedBy } = data ?? {};
    const promptInstance = repo.create({ user: { userId }, text, generatedBy });
    return await repo.save(promptInstance);
  }
}
