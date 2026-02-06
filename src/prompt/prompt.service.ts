import { Injectable, NotFoundException } from '@nestjs/common';
import { PromptRepository } from './repositories/prompt.repository';
import { DataSource } from 'typeorm';
import { CreatePromptDTO } from './dto/createPrompt.dto';
import { UserRepository } from 'src/userModule/user.repository';
import { FirstAidService } from 'src/first-aid/first-aid.service';
import { GetPromptQueryDTO } from './dto/getPrompt.dto';

@Injectable()
export class PromptService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly promptRepository: PromptRepository,
    private readonly userRepository: UserRepository,
    private readonly firstAidService: FirstAidService,
  ) {}

  async getPromptsByUserId(userId: number, query: GetPromptQueryDTO) {
    try {
      console.log({ query });
      const userExist = await this.userRepository.findById(userId);
      if (!userExist?.userId) throw new NotFoundException('User not found');

      const {data, nextCursor} = await this.promptRepository.getPromptsByUserId(userId, query);

      return {data, nextCursor};
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

      const r1 = await this.promptRepository.create(
        {
          userId,
          text: data?.text,
          generatedBy: data?.generatedBy ?? 'USER',
        },
        queryRunner,
      );

      const code = 'CUT_BLEEDING';
      const firstAidInstance = await this.firstAidService.findOneByCode(code);

      const replyPrompt = await this.promptRepository.create(
        {
          userId,
          triageLevel: 'HIGH',
          firstAid: firstAidInstance ?? undefined,
          hospitalLookupNeeded: true,
          generatedBy: 'SYSTEM',
        },
        queryRunner,
      );

      await queryRunner.commitTransaction();

      console.log({ r1, replyPrompt });

      return replyPrompt;
    } catch (error) {
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
