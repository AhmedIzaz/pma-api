import { Module, forwardRef } from '@nestjs/common';
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
import { PrescriptionEntity } from './prescription.entity';
import { PrescriptionRepository } from './prescription.repository';
import { GoogleDriveService } from './google-drive.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { PromptModule } from 'src/prompt/prompt.module';
import { TranscriptionService } from './transcribe.service';
import { ConsultationFormatterService } from './consultationFormatter.service';
import { PdfService } from './pdf.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DoctorEntity,
      DoctorServiceEntity,
      ConsultationEntity,
      PrescriptionEntity,
    ]),
    ConfigModule,
    BlockchainModule,
    forwardRef(() => PromptModule),
  ],
  controllers: [DoctorController, DoctorViewController],
  providers: [
    DoctorService,
    DoctorRepository,
    DoctorServiceRepository,
    ConsultationRepository,
    PrescriptionRepository,
    GoogleDriveService,
    BlockchainService,
    TranscriptionService,
    ConsultationFormatterService,
    PdfService,
  ],
  exports: [TypeOrmModule, DoctorService, DoctorRepository],
})
export class DoctorModule { }
