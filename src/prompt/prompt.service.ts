import { Injectable, NotFoundException } from '@nestjs/common';
import { PromptRepository } from './repositories/prompt.repository';
import { DataSource } from 'typeorm';
import { CreatePromptDTO } from './dto/createPrompt.dto';
import { UserRepository } from 'src/userModule/user.repository';

@Injectable()
export class PromptService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly promptRepository: PromptRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async getPromptsByUserId(userId: number) {
    try {
      const userExist = await this.userRepository.findById(userId);
      if (!userExist?.userId) {
        throw new NotFoundException('User not found');
      }
      const prompts = await this.promptRepository.getPromptsByUserId(userId);
      return prompts;
    } catch (error) {
      throw error;
    }
  }

  async create(userId: number, data: CreatePromptDTO) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userExist = await this.userRepository.findById(userId);
      if (!userExist?.userId) {
        throw new NotFoundException('User not found');
      }

      const savedPrompt = await this.promptRepository.create({
        userId,
        text: data?.text,
        generatedBy: data?.generatedBy ?? 'USER',
      });
      await queryRunner.commitTransaction();
      return savedPrompt;
    } catch (error) {
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
