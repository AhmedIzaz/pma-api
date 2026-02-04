import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
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
import { ApiBearerAuth } from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';
import { TUserInterface } from 'src/userModule/interfaces/user.interface';

@Controller('prompt')
export class PromptController {
  constructor(private readonly promptService: PromptService) {}



  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get("get-prompts")
  async getPromptsController( @Request() req: ExpressRequest) {
    const { user } = (req as any) ?? {};
    const promptList = await this.promptService.getPromptsByUserId((user as TUserInterface)?.userId);
    return { data: promptList };
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
    await this.promptService.create((user as TUserInterface)?.userId, body);
    return { success: true };
  }
}
