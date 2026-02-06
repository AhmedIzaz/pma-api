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
    ) {}

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

    async create(data: TCreatePromptInterface, queryRunner?: QueryRunner) {
        const repo = this.getRepo(queryRunner);
        const {
            userId,
            text,
            generatedBy,
            triageLevel,
            firstAid,
            hospitalLookupNeeded,
        } = data ?? {};
        const promptInstance = repo.create({
            user: { userId },
            text,
            generatedBy,
            triageLevel,
            firstAid,
            hospitalLookupNeeded,
        });
        return await repo.save(promptInstance);
    }
}
