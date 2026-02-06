import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    Post,
    Query,
    Request,
    SerializeOptions,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { PromptService } from './prompt.service';
import {
    CreatePromptDTO,
    CreatePromptResponseDTO,
} from './dto/createPrompt.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';
import { TUserInterface } from 'src/userModule/interfaces/user.interface';
import { GetPromptQueryDTO, GetPromptsResponseDTO } from './dto/getPrompt.dto';

@Controller('prompt')
export class PromptController {
    constructor(private readonly promptService: PromptService) {}

    @UseInterceptors(ClassSerializerInterceptor)
    @SerializeOptions({
        type: GetPromptsResponseDTO,
        excludeExtraneousValues: true,
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Get('get-prompts')
    async getPromptsController(
        @Request() req: ExpressRequest,
        @Query() query: GetPromptQueryDTO,
    ) {
        const { user } = (req as any) ?? {};

        const {data, nextCursor} = await this.promptService.getPromptsByUserId(
            (user as TUserInterface)?.userId,
            query,
        );
        return { data, nextCursor };
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @SerializeOptions({
        type: CreatePromptResponseDTO,
        excludeExtraneousValues: true,
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Post('create')
    async createPromptController(
        @Body() body: CreatePromptDTO,
        @Request() req: ExpressRequest,
    ) {
        const { user } = (req as any) ?? {};
        const response = await this.promptService.create(
            (user as TUserInterface)?.userId,
            body,
        );
        console.log({ response });
        return response;
    }
}
