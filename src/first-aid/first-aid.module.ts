import { Module } from '@nestjs/common';
import { FirstAidService } from './first-aid.service';
import { FirstAidController } from './first-aid.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirstAidEntity } from './entities/first-aid.entity';
import { FirstAidRepository } from './repositories/firstAid.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FirstAidEntity])],
  controllers: [FirstAidController],
  providers: [FirstAidService, FirstAidRepository],
  exports:[FirstAidService]
})
export class FirstAidModule {}
