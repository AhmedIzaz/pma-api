import { Module } from '@nestjs/common';
import { PromptService } from './prompt.service';
import { PromptController } from './prompt.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromptEntity } from './entities/prompt.entity';
import { JwtModule } from '@nestjs/jwt';
import { PromptRepository } from './repositories/prompt.repository';
import { UserModule } from 'src/userModule/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([PromptEntity]), UserModule],
  controllers: [PromptController],
  providers: [PromptService, PromptRepository],
})
export class PromptModule {}
