import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentEntity } from './payment.entity';
import { ConfigModule } from '@nestjs/config';
import { DoctorModule } from 'src/doctorModule/doctor.module';
import { UserModule } from 'src/userModule/user.module';
import { ConsultationEntity } from 'src/doctorModule/consultation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentEntity, ConsultationEntity]),
    ConfigModule,
    forwardRef(() => UserModule),
    forwardRef(() => DoctorModule),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule { }
