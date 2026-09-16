import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PromptRepository } from './repositories/prompt.repository';
import { DataSource } from 'typeorm';
import { CreatePromptDTO } from './dto/createPrompt.dto';
import { UserRepository } from 'src/userModule/user.repository';
import { FirstAidService } from 'src/first-aid/first-aid.service';
import { GetPromptQueryDTO } from './dto/getPrompt.dto';
import { HealthProgressQueryDTO } from './dto/healthProgress.dto';
import { SymptomAiService } from './symptom-ai.service';
import { SymptomTriageLevelEnum } from 'src/common/enums/triage.enum';
import Redis from 'ioredis';

@Injectable()
export class PromptService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly promptRepository: PromptRepository,
    private readonly userRepository: UserRepository,
    private readonly firstAidService: FirstAidService,
    private readonly symptomAiService: SymptomAiService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis
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



  async getHealthProgress(userId: number, query: HealthProgressQueryDTO) {
    const userExist = await this.userRepository.findById(userId);
    if (!userExist?.userId) throw new NotFoundException('User not found');

    const { period = 'weekly', from, to } = query;
    const rawData: any[] = await this.promptRepository.getHealthProgress(
      userId,
      period,
      from,
      to,
    );

    const SEVERITY_MAP = { HIGH: 3, MEDIUM: 2, LOW: 1 } as const;

    const timeline = rawData.map((row, index) => {
      const currentScore = parseFloat(row.severityScore) || 0;
      const prevScore =
        index > 0 ? parseFloat(rawData[index - 1].severityScore) || 0 : null;

      let delta: { direction: string; change: number } | null = null;
      if (prevScore !== null) {
        const change = +(currentScore - prevScore).toFixed(2);
        delta = {
          direction:
            change < 0 ? 'IMPROVING' : change > 0 ? 'WORSENING' : 'STABLE',
          change: Math.abs(change),
        };
      }

      return {
        date: row.date,
        severityScore: +currentScore.toFixed(2),
        triageCounts: {
          HIGH: parseInt(row.highCount) || 0,
          MEDIUM: parseInt(row.mediumCount) || 0,
          LOW: parseInt(row.lowCount) || 0,
        },
        totalPrompts: parseInt(row.totalPrompts) || 0,
        hospitalLookupCount: parseInt(row.hospitalLookupCount) || 0,
        delta,
      };
    });

    const totalInteractions = timeline.reduce(
      (sum, t) => sum + t.totalPrompts,
      0,
    );

    const frequencyMap = {
      HIGH: timeline.reduce((sum, t) => sum + t.triageCounts.HIGH, 0),
      MEDIUM: timeline.reduce((sum, t) => sum + t.triageCounts.MEDIUM, 0),
      LOW: timeline.reduce((sum, t) => sum + t.triageCounts.LOW, 0),
    };

    const weightedAvg =
      totalInteractions > 0
        ? (frequencyMap.HIGH * SEVERITY_MAP.HIGH +
          frequencyMap.MEDIUM * SEVERITY_MAP.MEDIUM +
          frequencyMap.LOW * SEVERITY_MAP.LOW) /
        totalInteractions
        : 0;

    let averageSeverity: 'HIGH' | 'MEDIUM' | 'LOW';
    if (weightedAvg >= 2.5) averageSeverity = 'HIGH';
    else if (weightedAvg >= 1.5) averageSeverity = 'MEDIUM';
    else averageSeverity = 'LOW';

    let overallDelta: 'IMPROVING' | 'WORSENING' | 'STABLE' = 'STABLE';
    if (timeline.length >= 2) {
      const first = timeline[0].severityScore;
      const last = timeline[timeline.length - 1].severityScore;
      if (last < first) overallDelta = 'IMPROVING';
      else if (last > first) overallDelta = 'WORSENING';
    }

    return {
      summary: {
        totalInteractions,
        averageSeverity,
        overallDelta,
        periodStart:
          timeline.length > 0 ? timeline[0].date : (from ?? null),
        periodEnd:
          timeline.length > 0
            ? timeline[timeline.length - 1].date
            : (to ?? null),
      },
      timeline,
      frequencyMap,
    };
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

      const generatedBy = data?.generatedBy ?? 'USER'

      const cachedPromptResultKey = `CACHED_PROMPT:${userId}:${generatedBy}:${data?.text?.trim()?.split(' ').join('_')}`

      const cachedPromptResult = await this.redis.get(cachedPromptResultKey);
      if (cachedPromptResult) {
        return JSON.parse(cachedPromptResult);
      }

      const r1 = await this.promptRepository.create(
        {
          userId,
          text: data?.text,
          generatedBy,
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

        const code = parsedResult?.code;
        if (code) {
          let existing = await this.firstAidService.findOneByCode(code);
          if (!existing) {
            existing = await this.firstAidService.create(code, parsedResult?.firstAid, queryRunner);
          }

        }
      }


      await this.redis.set(cachedPromptResultKey, JSON.stringify(parsedResult), "EX", 60 * 60 * 24);

      await queryRunner.commitTransaction();



      return parsedResult;
    } catch (error) {
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
