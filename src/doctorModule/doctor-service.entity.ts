import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonDateEntity } from 'src/common/entities/date.entity';
import { DoctorEntity } from './doctor.entity';

@Entity('doctor_services')
export class DoctorServiceEntity {
  @PrimaryGeneratedColumn()
  serviceId: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  serviceName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  costPerHour: number;

  @Column({ type: 'int', default: 1 })
  durationHours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  totalCost: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => DoctorEntity, (doctor) => doctor.services, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctorId' })
  doctor: DoctorEntity;

  @Column()
  doctorId: number;

  @Column(() => CommonDateEntity, { prefix: false })
  dateInfo: CommonDateEntity;
}
