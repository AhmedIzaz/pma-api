import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DoctorEntity } from './doctor.entity';
import { DoctorServiceEntity } from './doctor-service.entity';
import { ConsultationEntity } from './consultation.entity';
import { DoctorController } from './doctor.controller';
import { DoctorViewController } from './doctor-view.controller';
import { DoctorService } from './doctor.service';
import { DoctorRepository } from './doctor.repository';
import { DoctorServiceRepository } from './doctor-service.repository';
import { ConsultationRepository } from './consultation.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DoctorEntity,
      DoctorServiceEntity,
      ConsultationEntity,
    ]),
    ConfigModule,
  ],
  controllers: [DoctorController, DoctorViewController],
  providers: [
    DoctorService,
    DoctorRepository,
    DoctorServiceRepository,
    ConsultationRepository,
  ],
  exports: [TypeOrmModule, DoctorService, DoctorRepository],
})
export class DoctorModule {}
