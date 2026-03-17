import { Injectable, NotFoundException } from '@nestjs/common';
import { PromptRepository } from './repositories/prompt.repository';
import { DataSource } from 'typeorm';
import { CreatePromptDTO } from './dto/createPrompt.dto';
import { UserRepository } from 'src/userModule/user.repository';
import { FirstAidService } from 'src/first-aid/first-aid.service';
import { GetPromptQueryDTO } from './dto/getPrompt.dto';
import { SymptomAiService } from './symptom-ai.service';
import { SymptomTriageLevelEnum } from 'src/common/enums/triage.enum';

@Injectable()
export class PromptService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly promptRepository: PromptRepository,
    private readonly userRepository: UserRepository,
    private readonly firstAidService: FirstAidService,
    private readonly symptomAiService: SymptomAiService,
  ) { }

  async getPromptsByUserId(userId: number, query: GetPromptQueryDTO) {
    try {
      console.log({ query });
      const userExist = await this.userRepository.findById(userId);
      if (!userExist?.userId) throw new NotFoundException('User not found');

      const { data, nextCursor } = await this.promptRepository.getPromptsByUserId(userId, query);

      return { data, nextCursor };
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

      const symptomAiResult = await this.symptomAiService.analyzeText(data?.text);
      console.log({ symptomAiResult });

      const code = symptomAiResult?.first_aid_code;
      const firstAidInstance = await this.firstAidService.findOneByCode(code);

      const replyPrompt = await this.promptRepository.create(
        {
          userId,
          triageLevel: SymptomTriageLevelEnum[symptomAiResult?.triage_level],
          firstAid: firstAidInstance ?? undefined,
          hospitalLookupNeeded: symptomAiResult?.hospital_lookup_needed,
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


  async createBackup(userId: number, data: CreatePromptDTO) {
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

      const symptomAiResult = await this.symptomAiService.getAiResponse(data?.text);

      const parsedResult = JSON.parse(symptomAiResult);

      if (!parsedResult?.message) {
        const r2 = await this.promptRepository.create(
          {
            userId,
            triageLevel: parsedResult?.triageLevel,
            firstAidString: parsedResult?.firstAid,
            hospitalLookupNeeded: parsedResult?.hospitalLookupNeeded,
            generatedBy: 'SYSTEM',
          },
          queryRunner,
        );
      }



      await queryRunner.commitTransaction();



      return parsedResult;
    } catch (error) {
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
