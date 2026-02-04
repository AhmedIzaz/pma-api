import { Module } from '@nestjs/common';
import { PromptService } from './prompt.service';
import { PromptController } from './prompt.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromptEntity } from './entities/prompt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PromptEntity])],
  controllers: [PromptController],
  providers: [PromptService],
})
export class PromptModule {}
