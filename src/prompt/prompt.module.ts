import { Module, forwardRef } from '@nestjs/common';
import { PromptService } from './prompt.service';
import { PromptController } from './prompt.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromptEntity } from './entities/prompt.entity';
import { JwtModule } from '@nestjs/jwt';
import { PromptRepository } from './repositories/prompt.repository';
import { UserModule } from 'src/userModule/user.module';
import { FirstAidEntity } from 'src/first-aid/entities/first-aid.entity';
import { FirstAidModule } from 'src/first-aid/first-aid.module';
import { SymptomAiService } from './symptom-ai.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PromptEntity, FirstAidEntity]),
    forwardRef(() => UserModule),
    FirstAidModule
  ],
  controllers: [PromptController],
  providers: [PromptService, PromptRepository, SymptomAiService],
  exports: [SymptomAiService],
})
export class PromptModule { }
