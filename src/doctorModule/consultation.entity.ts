import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonDateEntity } from 'src/common/entities/date.entity';
import { DoctorEntity } from './doctor.entity';
import { DoctorServiceEntity } from './doctor-service.entity';
import { TConsultationStatusEnum } from 'src/common/enums/database.enum';
import { UserEntity } from 'src/userModule/user.entity';

@Entity('consultations')
export class ConsultationEntity {
  @PrimaryGeneratedColumn()
  consultationId: number;

  @ManyToOne(() => DoctorEntity, (doctor) => doctor.consultations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctorId' })
  doctor: DoctorEntity;

  @Column()
  doctorId: number;

  @ManyToOne(() => UserEntity, undefined, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'int', nullable: true })
  userId?: number;

  @ManyToOne(() => DoctorServiceEntity, undefined, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'serviceId' })
  service: DoctorServiceEntity;

  @Column({ type: 'int', nullable: true })
  serviceId?: number;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime?: Date;

  @Column({ type: 'int', default: 0 })
  durationMinutes: number;

  @Column({ type: 'int', nullable: true })
  requestedDurationHours?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountEarned: number;

  @Column({
    type: 'enum',
    enum: TConsultationStatusEnum,
    default: TConsultationStatusEnum.SCHEDULED,
  })
  status: TConsultationStatusEnum;

  @Column(() => CommonDateEntity, { prefix: false })
  dateInfo: CommonDateEntity;
}
