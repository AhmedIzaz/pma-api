import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PromptEntity } from '../entities/prompt.entity';
import {
    FindOptions,
    FindOptionsWhere,
    MoreThan,
    QueryRunner,
    Repository,
} from 'typeorm';
import { TCreatePromptInterface } from '../interfaces/createPrompt.interface';
import type { TGetPromptsFilters } from '../interfaces/getPrompts.interface';

@Injectable()
export class PromptRepository {
    constructor(
        @InjectRepository(PromptEntity)
        private readonly promptRepository: Repository<PromptEntity>,
    ) { }

    getRepo(queryRunner?: QueryRunner) {
        const repo = queryRunner
            ? queryRunner?.manager?.getRepository(PromptEntity)
            : this.promptRepository;
        return repo;
    }

    async getPromptsByUserId(userId: number, filters?: TGetPromptsFilters) {
        let { limit, afterCursor } = filters ?? {};
        limit = limit ?? 0;

        const where: FindOptionsWhere<PromptEntity> = {
            user: { userId },
        };

        if (afterCursor) {
            where.id = MoreThan(String(afterCursor));
        }

        let data = await this.promptRepository.find({
            where,
            take: limit + 1,
            relations: {
                firstAid: true,
            },
        });

        const hasMore = data?.length > limit;

        if (hasMore) {
            data = data?.slice(0, limit);
        }

        const nextCursor = hasMore ? data?.[data?.length - 1]?.id : null;

        return {
            data,
            nextCursor,
        };
    }

    async getHealthProgress(
        userId: number,
        period: string,
        from?: string,
        to?: string,
    ) {
        let dateGroupExpr: string;

        switch (period) {
            case 'monthly':
                dateGroupExpr = "DATE_FORMAT(pe.createdAt, '%Y-%m-01')";
                break;
            case 'weekly':
                dateGroupExpr =
                    'DATE(DATE_SUB(pe.createdAt, INTERVAL WEEKDAY(pe.createdAt) DAY))';
                break;
            default:
                dateGroupExpr = 'DATE(pe.createdAt)';
                break;
        }

        const params: any[] = [userId];
        let dateFilter = '';

        if (from) {
            dateFilter += ' AND pe.createdAt >= ?';
            params.push(from);
        }
        if (to) {
            dateFilter += ' AND pe.createdAt <= ?';
            params.push(to);
        }

        const sql = `
      SELECT
        ${dateGroupExpr} AS date,
        COUNT(*) AS totalPrompts,
        SUM(CASE WHEN pe.triageLevel = 'HIGH' THEN 1 ELSE 0 END) AS highCount,
        SUM(CASE WHEN pe.triageLevel = 'MEDIUM' THEN 1 ELSE 0 END) AS mediumCount,
        SUM(CASE WHEN pe.triageLevel = 'LOW' THEN 1 ELSE 0 END) AS lowCount,
        SUM(CASE WHEN pe.hospitalLookupNeeded = 1 THEN 1 ELSE 0 END) AS hospitalLookupCount,
        AVG(
          CASE
            WHEN pe.triageLevel = 'HIGH' THEN 3
            WHEN pe.triageLevel = 'MEDIUM' THEN 2
            WHEN pe.triageLevel = 'LOW' THEN 1
            ELSE NULL
          END
        ) AS severityScore
      FROM prompt_entity pe
      WHERE pe.userUserId = ?
        AND pe.generatedBy = 'SYSTEM'
        AND pe.triageLevel IS NOT NULL
        ${dateFilter}
      GROUP BY ${dateGroupExpr}
      ORDER BY date ASC
    `;

        return this.promptRepository.manager.query(sql, params);
    }

    async create(data: TCreatePromptInterface, queryRunner?: QueryRunner) {
        const repo = this.getRepo(queryRunner);
        const {
            userId,
            text,
            generatedBy,
            triageLevel,
            firstAid,
            firstAidString,
            hospitalLookupNeeded,
        } = data ?? {};
        const promptInstance = repo.create({
            user: { userId },
            text,
            generatedBy,
            triageLevel,
            firstAid,
            firstAidString,
            hospitalLookupNeeded,
        });
        return await repo.save(promptInstance);
    }
}
